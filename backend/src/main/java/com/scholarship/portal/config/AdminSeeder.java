package com.scholarship.portal.config;
import com.scholarship.portal.entity.User;import com.scholarship.portal.enums.Role;import com.scholarship.portal.repository.UserRepository;import org.springframework.beans.factory.annotation.Value;import org.springframework.boot.CommandLineRunner;import org.springframework.context.annotation.Bean;import org.springframework.context.annotation.Configuration;import org.springframework.security.crypto.password.PasswordEncoder;
@Configuration
public class AdminSeeder {
 @Bean CommandLineRunner seedAdmin(UserRepository users,PasswordEncoder encoder,@Value("${app.admin.email:}") String email,@Value("${app.admin.password:}") String password,@Value("${app.admin.name:Portal Admin}") String name){return args->{if(email!=null&&!email.isBlank()&&password!=null&&!password.isBlank()&&!users.existsByEmail(email.toLowerCase())){User u=new User();u.setFullName(name);u.setEmail(email.toLowerCase());u.setPassword(encoder.encode(password));u.setRole(Role.ADMIN);users.save(u);}};}
}
