package com.tester.api

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class TesterApiApplication

fun main(args: Array<String>) {
    runApplication<TesterApiApplication>(*args)
}
