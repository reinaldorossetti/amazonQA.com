package com.tester.api

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer
import org.springframework.boot.builder.SpringApplicationBuilder

@SpringBootApplication
class TesterApiApplication : SpringBootServletInitializer() {
    override fun configure(builder: SpringApplicationBuilder): SpringApplicationBuilder {
        return builder.sources(TesterApiApplication::class.java)
    }
}

fun main(args: Array<String>) {
    runApplication<TesterApiApplication>(*args)
}
