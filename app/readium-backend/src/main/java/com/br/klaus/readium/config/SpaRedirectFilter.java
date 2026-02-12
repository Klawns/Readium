package com.br.klaus.readium.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SpaRedirectFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String path = request.getRequestURI();
        
        // Se não for API e não tiver extensão (arquivo estático), redireciona para index.html
        // Isso permite que o React Router controle as rotas no frontend (ex: /books/1)
        if (!path.startsWith("/api") && !path.contains(".")) {
            request.getRequestDispatcher("/index.html").forward(request, response);
            return;
        }
        
        filterChain.doFilter(request, response);
    }
}
