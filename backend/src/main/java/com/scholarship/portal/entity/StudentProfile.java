package com.scholarship.portal.entity;
import jakarta.persistence.*; import lombok.*; import java.time.LocalDate;
@Entity @Table(name="student_profiles") @Getter @Setter @NoArgsConstructor
public class StudentProfile {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @OneToOne(optional=false) @JoinColumn(name="user_id",unique=true) private User user;
 private LocalDate dateOfBirth; private String gender; private String address; private String city; private String state; private String postalCode; private String category;
}
