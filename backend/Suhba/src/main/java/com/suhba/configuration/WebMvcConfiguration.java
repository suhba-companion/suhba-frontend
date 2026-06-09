package com.suhba.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// CORS is handled by SecurityConfig.corsConfigurationSource() for all /api/** paths.
@Configuration
public class WebMvcConfiguration implements WebMvcConfigurer {
}
