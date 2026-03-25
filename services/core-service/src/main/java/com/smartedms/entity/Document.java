package com.smartedms.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "documents")
@Data
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(name = "folder_id")
    private Long folderId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private DocumentStatus status = DocumentStatus.DRAFT;

    @Column(name = "approver_id")
    private Long approverId;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

}
