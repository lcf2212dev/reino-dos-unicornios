// Painel do GNOME: o que a Mariana fez no Reino, dia a dia. Só LÊ o progresso (GET, como o jogo faz ao abrir);
// nunca grava no banco. Guarda localmente só o diário de contagens (resumo.js), nunca o save.
import GLib from 'gi://GLib';
import Soup from 'gi://Soup?version=3.0';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import { resumir, atualizarDiario } from './resumo.js';

const URL = 'https://reino-dos-unicornios.vercel.app/api/progresso';
const A_CADA_MIN = 30;
const PASTA = GLib.build_filenamev([GLib.get_user_data_dir(), 'reino-acompanhamento']);
const DIARIO = GLib.build_filenamev([PASTA, 'diario.json']);
const SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

function lerJson(caminho, padrao) {
  try { return JSON.parse(new TextDecoder().decode(GLib.file_get_contents(caminho)[1])); } catch (e) { return padrao; }
}

function rotuloDia(k) {
  const d = new Date(k + 'T12:00:00');
  const hoje = new Date(); hoje.setHours(12, 0, 0, 0);
  const dif = Math.round((hoje - d) / 86400000);
  const base = SEMANA[d.getDay()] + ' ' + k.slice(8, 10) + '/' + k.slice(5, 7);
  return dif === 0 ? 'Hoje (' + base + ')' : dif === 1 ? 'Ontem (' + base + ')' : base;
}

export default class ReinoAcompanhamento extends Extension {
  enable() {
    this._nomes = lerJson(GLib.build_filenamev([this.path, 'nomes.json']), {});
    this._sessao = new Soup.Session({ timeout: 20 });
    this._botao = new PanelMenu.Button(0.0, 'Reino dos Unicórnios', false);
    this._botao.add_child(new St.Label({ text: '🦄', y_align: 2 }));
        Main.panel.addToStatusArea(this.uuid, this._botao);
    this._mostrar(null, 'Carregando…');
    this._buscar();
    this._timer = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, A_CADA_MIN * 60, () => { this._buscar(); return GLib.SOURCE_CONTINUE; });
  }

  disable() {
    if (this._timer) GLib.source_remove(this._timer);
    this._timer = null;
    const s = this._sessao;
    this._sessao = null;
    this._buscando = false;
    s?.abort();
    this._botao?.destroy();
    this._botao = null;
  }

  _buscar() {
    if (!this._sessao || this._buscando) return;
    this._buscando = true;
    const msg = Soup.Message.new('GET', URL);
    const sessao = this._sessao;
    sessao.send_and_read_async(msg, GLib.PRIORITY_DEFAULT, null, (s, res) => {
      if (sessao !== this._sessao || !this._botao) return;
      this._buscando = false;
      let doc;
      try {
        const bytes = s.send_and_read_finish(res);
        if (msg.get_status() !== 200) throw new Error('HTTP ' + msg.get_status());
        doc = JSON.parse(new TextDecoder().decode(bytes.get_data()));
      } catch (e) {
        this._mostrar(this._ultimo || null, 'Sem conexão: ' + e.message);
        return;
      }
      try {
        if (!doc || !doc.estado || typeof doc.estado !== 'object') throw new Error('resposta sem progresso');
        const agora = Date.now();
        const diario = atualizarDiario(lerJson(DIARIO, {}), doc.estado, agora);
        GLib.mkdir_with_parents(PASTA, 0o700);
        GLib.file_set_contents(DIARIO, JSON.stringify(diario));
        this._mostrar(resumir(doc.estado, diario, this._nomes, agora), null);
      } catch (e) {
        this._mostrar(this._ultimo || null, 'Erro ao montar o resumo: ' + e.message);
      }
    });
  }

  _mostrar(dias, aviso) {
    if (dias) this._ultimo = dias;
    const menu = this._botao.menu;
    menu.removeAll();
    const titulo = new PopupMenu.PopupMenuItem('Mariana no Reino dos Unicórnios', { reactive: false });
    menu.addMenuItem(titulo);
    if (aviso) menu.addMenuItem(new PopupMenu.PopupMenuItem(aviso, { reactive: false }));
    menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    if (dias && !dias.length) menu.addMenuItem(new PopupMenu.PopupMenuItem('Nada registrado nos últimos dias.', { reactive: false }));
    (dias || []).forEach((d, i) => {
      const sub = new PopupMenu.PopupSubMenuMenuItem(rotuloDia(d.dia) + ' · ' + d.linhas.length + (d.linhas.length > 1 ? ' coisas' : ' coisa'));
      d.linhas.forEach((t) => sub.menu.addMenuItem(new PopupMenu.PopupMenuItem(t, { reactive: false })));
      menu.addMenuItem(sub);
      if (i === 0) sub.setSubmenuShown(true);
    });
    menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    const at = new PopupMenu.PopupMenuItem('Atualizar agora');
    at.connect('activate', () => this._buscar());
    menu.addMenuItem(at);
  }
}
