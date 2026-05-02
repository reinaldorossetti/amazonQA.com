rootProject.name = "AmazonQA"

include(":shared")
include(":androidApp")

pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
        // Detox AAR ships inside npm (`projects-tests/detox-mobile/node_modules/detox/Detox-android`).
        maven {
            url = uri(settingsDir.resolve("../projects-tests/detox-mobile/node_modules/detox/Detox-android"))
        }
    }
}
