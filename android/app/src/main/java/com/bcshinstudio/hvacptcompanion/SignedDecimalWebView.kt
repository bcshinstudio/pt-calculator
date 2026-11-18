package com.bcshinstudio.hvacptcompanion

import android.content.Context
import android.text.InputType
import android.util.AttributeSet
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputConnection
import android.webkit.WebView

/**
 * Android WebView maps HTML inputmode="decimal" to TYPE_NUMBER_FLAG_DECIMAL,
 * without TYPE_NUMBER_FLAG_SIGNED. Some keyboards (notably Samsung Keyboard)
 * consequently omit the minus key for numeric fields.
 *
 * This class advertises *both* decimal and signed numeric entry to the IME.
 * It does not add a visible on-screen button or change WebView text handling.
 */
class SignedDecimalWebView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = android.R.attr.webViewStyle
) : WebView(context, attrs, defStyleAttr) {

    override fun onCreateInputConnection(outAttrs: EditorInfo): InputConnection? {
        val connection = super.onCreateInputConnection(outAttrs)

        // Only adjust actual numeric input fields; leave dropdowns/text fields alone.
        if (connection != null &&
            (outAttrs.inputType and InputType.TYPE_MASK_CLASS) == InputType.TYPE_CLASS_NUMBER
        ) {
            outAttrs.inputType = outAttrs.inputType or
                InputType.TYPE_NUMBER_FLAG_SIGNED or
                InputType.TYPE_NUMBER_FLAG_DECIMAL
        }

        return connection
    }
}
