package app.vercel.reino_dos_unicornios.twa;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.window.OnBackInvokedDispatcher;

/**
 * O app inteiro: uma WebView com o jogo da Vercel. O jogo roda DENTRO deste app (não no Chrome), então o Family Link
 * trata o Reino como um app só dele: dá para deixá-lo "Sempre permitido" e manter o Chrome bloqueado.
 * O save vem da nuvem pelo login do jogo (a WebView tem armazenamento próprio, separado do Chrome); o service worker
 * do site guarda o jogo para abrir sem rede. Links para fora do site abrem fora do app (se o aparelho deixar).
 */
public class MainActivity extends Activity {
    private WebView web;
    private FrameLayout raiz;
    private boolean jaRecomecou;                  // o motor da página caiu uma vez: na segunda, fecha (sem loop)
    private View telaCheia;                      // o elemento em tela cheia (botão de tela cheia do jogo)
    private WebChromeClient.CustomViewCallback fecharTelaCheia;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle salvo) {
        super.onCreate(salvo);
        raiz = new FrameLayout(this);
        raiz.setBackgroundColor(Color.TRANSPARENT);   // deixa aparecer o unicórnio da abertura (windowBackground)
        // Android 15+ desenha embaixo das barras (edge-to-edge): o jogo fica entre elas (o rodapé e a dock tocáveis)
        raiz.setFitsSystemWindows(true);
        web = new WebView(this);
        web.setBackgroundColor(Color.TRANSPARENT);   // o unicórnio da abertura aparece até a página pintar
        raiz.addView(web, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(raiz);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);                 // localStorage: o save do jogo no aparelho
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false); // vozes e músicas do jogo
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setUserAgentString(s.getUserAgentString() + " ReinoApp/" + BuildConfig.VERSION_NAME);

        final String host = getString(R.string.host);
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest req) {
                Uri u = req.getUrl();
                if ("https".equals(u.getScheme()) && host.equals(u.getHost())) return false;   // o jogo fica aqui dentro
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, u));
                } catch (ActivityNotFoundException | SecurityException e) {
                    // aparelho sem navegador liberado (Family Link): o link simplesmente não abre
                }
                return true;
            }

            @Override
            public void onPageCommitVisible(WebView v, String url) {
                v.setBackgroundColor(getColor(R.color.cor_fundo));
            }

            // o motor da página caiu (falta de memória num tablet fraco): recomeça o app em vez de fechar
            @Override
            public boolean onRenderProcessGone(WebView v, RenderProcessGoneDetail d) {
                raiz.removeView(v);
                v.destroy();
                web = null;
                if (jaRecomecou || isFinishing() || isDestroyed()) { finish(); return true; }
                jaRecomecou = true;      // uma recriação só; se cair de novo, o app fecha em vez de ficar em loop
                recreate();
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onShowCustomView(View v, CustomViewCallback cb) {
                if (telaCheia != null) { cb.onCustomViewHidden(); return; }
                telaCheia = v;
                fecharTelaCheia = cb;
                raiz.addView(v, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
                esconderBarras(true);
            }

            @Override
            public void onHideCustomView() {
                if (telaCheia == null) return;
                raiz.removeView(telaCheia);
                telaCheia = null;
                if (fecharTelaCheia != null) fecharTelaCheia.onCustomViewHidden();
                fecharTelaCheia = null;
                esconderBarras(false);
            }
        });

        // um link do jogo que abriu o app vence o estado salvo (ex.: ?servidor=XXXX depois de o sistema matar o app)
        boolean temLink = getIntent() != null && getIntent().getData() != null;
        if (temLink || salvo == null || web.restoreState(salvo) == null) web.loadUrl(enderecoDe(getIntent()));

        // voltar no Android 13+ (o onBackPressed não é chamado com targetSdk 36 no Android 16)
        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::voltar);
        }
    }

    // sai da tela cheia, volta uma página do jogo ou fecha o app
    private void voltar() {
        if (web == null) { finish(); return; }
        if (telaCheia != null) { web.getWebChromeClient().onHideCustomView(); return; }
        if (web.canGoBack()) { web.goBack(); return; }
        finish();
    }

    // o link do jogo que abriu o app (convite do "Jogar com amigos", ?servidor=XXXX) ou o começo do jogo
    private String enderecoDe(Intent i) {
        Uri u = i != null ? i.getData() : null;
        if (u != null && "https".equals(u.getScheme()) && getString(R.string.host).equals(u.getHost())) return u.toString();
        return getString(R.string.endereco);
    }

    @Override
    protected void onNewIntent(Intent i) {
        super.onNewIntent(i);
        setIntent(i);
        if (i.getData() != null && web != null) web.loadUrl(enderecoDe(i));   // o app já aberto recebe um link do jogo
    }

    @SuppressWarnings("deprecation")
    private void esconderBarras(boolean esconder) {
        Window w = getWindow();
        w.getDecorView().setSystemUiVisibility(esconder
            ? View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            : View.SYSTEM_UI_FLAG_VISIBLE);
    }

    @Override
    protected void onSaveInstanceState(Bundle estado) {
        super.onSaveInstanceState(estado);
        if (web != null) web.saveState(estado);
    }

    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() {
        voltar();   // Android 12 ou anterior
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (web != null) { web.onPause(); web.pauseTimers(); }   // música e relógio do jogo param no fundo
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) { web.onResume(); web.resumeTimers(); }
    }

    @Override
    protected void onDestroy() {
        if (web != null) { raiz.removeView(web); web.destroy(); web = null; }
        super.onDestroy();
    }
}
