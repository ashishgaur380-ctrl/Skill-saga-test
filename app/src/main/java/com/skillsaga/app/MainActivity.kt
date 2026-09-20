package com.skillsaga.app

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.ConsoleMessage
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    // Skill Saga 2.0: always load the frozen 2.0 learner UI from the current Pages deployment.
    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        webView = WebView(this)
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.allowFileAccess = true
        webView.settings.allowContentAccess = true
        webView.settings.databaseEnabled = true
        webView.settings.javaScriptCanOpenWindowsAutomatically = true
        webView.settings.setSupportMultipleWindows(false)
        webView.settings.cacheMode = android.webkit.WebSettings.LOAD_NO_CACHE
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) { super.onPageFinished(view, url); injectAccessConfiguration() }
            override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                if (request?.isForMainFrame == true) Toast.makeText(this@MainActivity, "Skill Saga loading error", Toast.LENGTH_LONG).show()
            }
        }
        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(message: ConsoleMessage): Boolean {
                android.util.Log.e("SkillSagaWeb", message.message())
                return true
            }
        }
        setContentView(webView)
        webView.loadUrl("https://ashishgaur380-ctrl.github.io/Skill-saga-test/")
    }

    private fun injectAccessConfiguration() {
        try {
            val config = assets.open("quiz-access-config.js").bufferedReader().use { it.readText() }
            webView.evaluateJavascript(config, null)
        } catch (e: Exception) { android.util.Log.e("SkillSagaWeb", "Unable to load quiz access configuration", e) }
    }

    @Deprecated("Deprecated in Android API 33")
    override fun onBackPressed() { if (webView.canGoBack()) webView.goBack() else super.onBackPressed() }
}