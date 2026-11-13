package com.scholarship.portal.security;
import com.scholarship.portal.repository.UserRepository; import lombok.RequiredArgsConstructor; import org.springframework.security.core.userdetails.*; import org.springframework.stereotype.Service;
@Service @RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
 private final UserRepository users;
 @Override public UserDetails loadUserByUsername(String username)throws UsernameNotFoundException{return users.findByEmail(username).orElseThrow(()->new UsernameNotFoundException("User not found"));}
}
