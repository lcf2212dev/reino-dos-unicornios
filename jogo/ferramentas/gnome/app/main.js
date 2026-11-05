// Janela do dock: o que a Mariana fez no Reino, dia a dia (GTK4/Adwaita). Mesmo resumo e mesmo diário da extensão
// do painel (../extensao/resumo.js); só LÊ o progresso (GET), nunca grava no banco.
import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk?version=4.0';
import Adw from 'gi://Adw?version=1';
import Soup from 'gi://Soup?version=3.0';
import { resumir, atualizarDiario } from './resumo.js';

const URL = 'https://reino-dos-unicornios.vercel.app/api/progresso';
const PASTA = GLib.build_filenamev([GLib.get_user_data_dir(), 'reino-acompanhamento']);
const DIARIO = GLib.build_filenamev([PASTA, 'diario.json']);
const AQUI = GLib.path_get_dirname(GLib.filename_from_uri(import.meta.url)[0]);
const SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

function lerJson(caminho, padrao) {
  try { return JSON.parse(new TextDecoder().decode(GLib.file_get_contents(caminho)[1])); } catch (e) { return padrao; }
}
function rotuloDia(k) {
  const d = new Date(k + 'T12:00:00');
  const hoje = new Date(); hoje.setHours(12, 0, 0, 0);
  const dif = Math.round((hoje - d) / 86400000);
  const base = SEMANA[d.getDay()] + ', ' + k.slice(8, 10) + '/' + k.slice(5, 7);
  return dif === 0 ? 'Hoje · ' + base : dif === 1 ? 'Ontem · ' + base : base;
}
function esc(t) { return GLib.markup_escape_text(t, -1); }

const app = new Adw.Application({ application_id: 'br.dev.lcf2212.ReinoAcompanhamento' });
let janela, pagina, status, sessao, nomes, pedido = 0;

function mostrar(dias, aviso) {
  status.set_label(aviso || '');
  status.set_visible(!!aviso);
  if (!dias) return;
  let filho;
  while ((filho = pagina.get_first_child())) pagina.remove(filho);
  if (!dias.length) pagina.append(new Adw.StatusPage({ title: 'Nada registrado nos últimos dias', icon_name: 'face-smile-symbolic' }));
  dias.forEach((d, i) => {
    const grupo = new Adw.PreferencesGroup();
    const ex = new Adw.ExpanderRow({ title: esc(rotuloDia(d.dia)), subtitle: d.linhas.length + (d.linhas.length > 1 ? ' coisas' : ' coisa'), expanded: i === 0 });
    d.linhas.forEach((t) => ex.add_row(new Adw.ActionRow({ title: esc(t), title_lines: 0 })));
    grupo.add(ex);
    pagina.append(grupo);
  });
}

function buscar() {
  status.set_label('Atualizando…'); status.set_visible(true);
  const meu = ++pedido;
  const msg = Soup.Message.new('GET', URL);
  sessao.send_and_read_async(msg, GLib.PRIORITY_DEFAULT, null, (s, res) => {
    if (meu !== pedido) return;
    let doc;
    try {
      const bytes = s.send_and_read_finish(res);
      if (msg.get_status() !== 200) throw new Error('HTTP ' + msg.get_status());
      doc = JSON.parse(new TextDecoder().decode(bytes.get_data()));
    } catch (e) { mostrar(null, 'Sem conexão: ' + e.message); return; }
    try {
      if (!doc || !doc.estado || typeof doc.estado !== 'object') throw new Error('resposta sem progresso');
      const agora = Date.now();
      const diario = atualizarDiario(lerJson(DIARIO, {}), doc.estado, agora);
      GLib.mkdir_with_parents(PASTA, 0o700);
      GLib.file_set_contents(DIARIO, JSON.stringify(diario));
      mostrar(resumir(doc.estado, diario, nomes, agora, 30), null);
    } catch (e) { mostrar(null, 'Erro ao montar o resumo: ' + e.message); }
  });
}

app.connect('activate', () => {
  if (janela) { janela.present(); buscar(); return; }
  nomes = lerJson(GLib.build_filenamev([AQUI, 'nomes.json']), {});
  sessao = new Soup.Session({ timeout: 20 });
  janela = new Adw.ApplicationWindow({ application: app, title: 'Mariana no Reino', default_width: 520, default_height: 720 });
  const vista = new Adw.ToolbarView();
  const barra = new Adw.HeaderBar({ title_widget: new Adw.WindowTitle({ title: 'Mariana no Reino dos Unicórnios', subtitle: 'dia a dia' }) });
  const atualizar = new Gtk.Button({ icon_name: 'view-refresh-symbolic', tooltip_text: 'Atualizar' });
  atualizar.connect('clicked', buscar);
  barra.pack_start(atualizar);
  vista.add_top_bar(barra);
  const caixa = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 12, margin_top: 12, margin_bottom: 12, margin_start: 12, margin_end: 12 });
  status = new Gtk.Label({ wrap: true, visible: false, css_classes: ['dim-label'] });
  pagina = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 12 });
  caixa.append(status); caixa.append(pagina);
  const clamp = new Adw.Clamp({ maximum_size: 640, child: caixa });
  vista.set_content(new Gtk.ScrolledWindow({ child: clamp, vexpand: true }));
  janela.set_content(vista);
  janela.present();
  buscar();
});

app.run([]);
