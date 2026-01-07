package com.edutube.security;

import com.edutube.entity.User;
import com.edutube.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String providerId = oAuth2User.getName(); // sub

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Update provider info if needed
            if (user.getProvider() == null || !user.getProvider().equals("google")) {
                user.setProvider("google");
                user.setProviderId(providerId);
                userRepository.save(user); // existing user linking
            }
        } else {
            user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setProvider("google");
            user.setProviderId(providerId);
            user.setRole(User.Role.USER);
            userRepository.save(user);
        }

        String token = jwtUtils.generateJwtTokenFromEmail(email);

        // Redirect to frontend with token
        // Assuming frontend is at localhost:5173
        getRedirectStrategy().sendRedirect(request, response, "http://localhost:5173/login?token=" + token);
    }
}
