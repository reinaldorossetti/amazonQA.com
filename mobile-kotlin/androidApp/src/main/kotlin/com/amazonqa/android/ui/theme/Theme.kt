package com.amazonqa.android.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = AmazonOrange,
    secondary = AmazonYellow,
    tertiary = AmazonBlueLink,
    background = AmazonDark,
    surface = AmazonMediumDark,
    onPrimary = AmazonDark,
    onSecondary = AmazonDark,
    onBackground = AmazonLightGray,
    onSurface = AmazonLightGray,
)

private val LightColorScheme = lightColorScheme(
    primary = AmazonOrange,
    secondary = AmazonYellow,
    tertiary = AmazonBlueLink,
    background = AmazonLightGray,
    surface = AmazonLightGray,
    onPrimary = AmazonDark,
    onSecondary = AmazonDark,
    onBackground = AmazonDark,
    onSurface = AmazonDark,
)

@Composable
fun AmazonQATheme(darkTheme: Boolean = isSystemInDarkTheme(), content: @Composable () -> Unit) {
    val colorScheme = if (darkTheme) {
        DarkColorScheme
    } else {
        LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        shapes = Shapes,
        content = content
    )
}
