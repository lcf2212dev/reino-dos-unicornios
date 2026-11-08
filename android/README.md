# O app na Play Store (acesso restrito)

O app é uma **Trusted Web Activity**: ele não leva o jogo dentro; abre https://reino-dos-unicornios.vercel.app no
Chrome do aparelho, em tela cheia, sem barra de endereço, com o ícone e o nome do Reino. Por isso:

- **O jogo atualiza sozinho** (push na `main` → Vercel). Novo envio à Play só quando muda o app em si (ícone, nome,
  cores, este projeto); aí `npm run android -- --nova-versao`.
- **O save é o mesmo do site**: o app usa o armazenamento do Chrome para aquele endereço (`mariana-reino-v1`), e o
  login/senha do jogo e a sincronização com o banco da Vercel valem igual. Nada de save novo nem migração.
- **Sem rede** funciona como o app instalado da Vercel (o service worker do `vercel/pwa/`).
- Prova de dono: o site publica `/.well-known/assetlinks.json` (de `vercel/loja/assetlinks.json`, pelo
  `vercel/montar.js`) com a impressão digital de cada chave que assina o app. Impressão que falta = o app abre com
  uma barrinha de endereço em cima (funciona, mas não fica em tela cheia).

## Quem pode instalar (o "acesso restrito")
São duas travas, uma por cima da outra:
1. **Na Play Store, o app só existe para quem está na lista**: ele fica no **teste interno** (até 100 contas Google,
   pelo e-mail), sem nunca ir para "Produção". Quem não está na lista não acha o app na busca nem abre o link.
   Teste interno não passa pela revisão demorada do Google e não pede os 12 testadores por 14 dias que contas novas
   precisam para ir à produção.
2. **Na tela do jogo, ninguém entra sem login e senha** (`docs/contratos/save-e-mescla.md` §12): só quem tem conta.
   É uma trava de porta, não de cofre: a API da Vercel responde sem senha (lista os logins e devolve o progresso de
   quem souber o login) e as senhas ficam em texto. Os dados em si não são secretos (a política de privacidade diz isso).

O endereço da Vercel continua aberto no navegador, como hoje. Fechar o site ou a API é outra mudança, à parte.

## Fazer o .aab
```
npm run android                 # .aab e .apk em ~/Documents/reino-dos-unicornios-play/
npm run android -- --loja       # capturas de tela, recurso gráfico 1024×500 e ícone 512 (pasta loja/ ao lado)
npm run android -- --ajuda      # todas as opções
```
A **chave de envio** fica em `~/.config/reino-dos-unicornios/android/` (`envio.jks` + `assinatura.properties`, com a
senha). Não vai para o git. **Guarde uma cópia dessa pasta** (pendrive, gerenciador de senhas): perdê-la não perde o
app (a Play guarda a chave de assinatura de verdade), mas trocar a chave de envio pede suporte do Google.

## Publicar (uma vez, na Play Console)
1. **Conta de desenvolvedor**: https://play.google.com/console/signup — conta pessoal, taxa única de US$ 25,
   verificação de identidade (documento) e de telefone. Pode levar alguns dias.
2. **Criar app**: nome "Reino dos Unicórnios", idioma Português (Brasil), **Jogo**, **Gratuito**; aceite as declarações.
3. **Testar e lançar → Testes → Teste interno → Testadores**: crie uma lista de e-mails (as contas Google que vão
   instalar; a do aparelho da criança e as dos pais) e salve.
4. **Teste interno → Criar versão**: aceite a **Assinatura de apps do Google Play** e envie o `.aab`. Nome da versão e
   notas: "Primeira versão". Revise e lance para o teste interno.
5. **A chave do Google**: depois do 1º envio, em **Testar e lançar → Configuração → Integridade do app → Assinatura do
   app**, copie o **SHA-256 do certificado da chave de assinatura do app** e rode
   `npm run android -- --impressao <SHA-256> --sem-build` (ou mande o número para o Claude), commit e push: a Vercel
   publica. `npm run android -- --conferir-site` mostra se o Google já vê o app ligado ao site.
6. **Convite**: em **Teste interno → Testadores**, copie o **link de participação** e abra no celular de cada pessoa da
   lista (com a conta Google da lista): "Aceitar" → "Baixar na Google Play" → Instalar.

Conta de criança supervisionada pelo **Family Link** pode não conseguir aceitar o convite de teste. Se acontecer: ponha
na lista a conta Google de um dos pais e instale com ela no aparelho, ou instale o `.apk` por cabo
(`npm run android -- --instalar`, com a depuração USB ligada).

### O que a Play Console pergunta (respostas)
Para ficar só no teste interno, a Play cobra pouco além do .aab; estes itens (Política e programas → Conteúdo do app)
são obrigatórios para sair do teste interno, e preencher antes não atrapalha:
- **Política de privacidade**: https://reino-dos-unicornios.vercel.app/privacidade.html (`vercel/loja/privacidade.html`).
- **Acesso ao app**: "Todas ou algumas funcionalidades são restritas" → crie no jogo uma conta só para isso (ex.: login
  `revisor`) e informe login e senha.
- **Anúncios**: não tem.
- **Classificação de conteúdo**: questionário IARC, categoria Jogo; sem violência, sem compras, com interação entre
  usuários limitada a recados prontos ("Jogar com amigos"). Deve sair Livre.
- **Público-alvo**: 6–8 anos (e, se quiser, 9–12). Com crianças no público vale a Política para Famílias: sem anúncios,
  sem rastreamento, política de privacidade publicada (tudo já atendido).
- **Segurança dos dados**: coleta **sim**; criptografia em trânsito **sim**; o app cria conta, então pede a **URL de
  exclusão de conta**: https://reino-dos-unicornios.vercel.app/privacidade.html#apagar (pedido por e-mail).
  - *Informações pessoais → IDs de usuário* (o login): coletado, não compartilhado, obrigatório, para funcionalidade do
    app e gerenciamento da conta.
  - *Informações pessoais → Nome* (o nome do perfil) e *Outras informações pessoais* (menina/menino, aparência):
    coletados, não compartilhados, para funcionalidade do app.
  - *Atividade no app → Outras ações* (o progresso do jogo): coletado, não compartilhado, para funcionalidade do app.
  - Nada de localização, contatos, fotos/câmera, identificadores de publicidade ou análise.
  - A política de exclusão de conta da Play também pede um caminho **dentro do app**; hoje o pedido é só pelo e-mail
    (um link para `privacidade.html#apagar` nos Ajustes do jogo resolve; é mudança no jogo, à parte).
- **Apps de governo, financeiros, saúde, notícias**: não.

### Página da loja (só aparece para quem está na lista)
- **Descrição curta** (até 80): `Revisão da escola com unicórnios: perguntas, salas e um reino para cuidar.`
- **Descrição completa**: `Um jogo de revisão escolar feito em casa. A criança anda pelo Reino dos Unicórnios, entra
  nas salas de cada matéria (Português, Matemática, Ciências, História, Geografia e Inglês), responde às perguntas do
  bimestre com voz para ouvir os enunciados e ganha estrelas para chocar ovos, cuidar dos unicórnios e enfeitar a casa.
  Sem anúncios e sem compras. Cada jogador entra com login e senha.`
- **Imagens**: `npm run android -- --loja` → ícone 512×512, recurso gráfico 1024×500, capturas de celular e de tablet.
- **Categoria**: Jogo → Educativo. **E-mail de contato**: lcf2212.dev@gmail.com (o mesmo da política de privacidade;
  trocou, troque nos dois).

## Mexer neste projeto
- Configuração do app (id, endereço, nome, cores): o bloco `twa` do `app/build.gradle` (um lugar só).
  O `applicationId` (`app.vercel.reino_dos_unicornios.twa`) **nunca muda** depois do primeiro envio.
- Ícones e imagem de abertura: `npm run icones` (`jogo/ferramentas/pwa/gerar-icones.js`, a mesma arte do app da Vercel).
- Build: `npm run android` (`jogo/ferramentas/android/android.js`): JDK 17+ e Android SDK (`~/Android/Sdk`), saída do
  gradle em `/tmp/reino-testes/android/`. Requisito de `targetSdk` da Play sobe todo ano (agosto): suba o
  `compileSdk`/`targetSdk` e o plugin do Android aqui e envie uma versão nova.
