-- ============================================================
-- WEDDING APP — Script de migración MySQL (Hostinger)
-- Generado a partir del esquema Prisma
-- Ejecutar en: phpMyAdmin / MySQL Workbench / CLI de Hostinger
-- ============================================================
-- IMPORTANTE: Ajusta NOMBRE_BBDD al nombre real de tu BD.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. guests
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `guests` (
  `id`             VARCHAR(36)  NOT NULL,
  `created_at`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `name`           VARCHAR(255) NOT NULL,
  `code`           VARCHAR(50)  NOT NULL,
  `max_companions` INT          NOT NULL DEFAULT 1,
  `email`          VARCHAR(255)          DEFAULT NULL,
  `phone`          VARCHAR(50)           DEFAULT NULL,
  `notes`          TEXT                  DEFAULT NULL,
  `is_active`      TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `guests_code_key` (`code`),
  INDEX `guests_code_idx` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 2. rsvp_responses
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `rsvp_responses` (
  `id`         VARCHAR(36)  NOT NULL,
  `created_at` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `guest_id`   VARCHAR(36)           DEFAULT NULL,
  `guest_name` VARCHAR(255) NOT NULL,
  `attending`  TINYINT(1)   NOT NULL,
  `message`    TEXT                  DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rsvp_responses_guest_name_key` (`guest_name`),
  INDEX `rsvp_responses_guest_id_idx` (`guest_id`),
  INDEX `rsvp_responses_updated_at_idx` (`updated_at` DESC),
  CONSTRAINT `rsvp_responses_guest_id_fkey`
    FOREIGN KEY (`guest_id`) REFERENCES `guests` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 3. rsvp_attendees
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `rsvp_attendees` (
  `id`              VARCHAR(36)  NOT NULL,
  `created_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `rsvp_id`         VARCHAR(36)  NOT NULL,
  `guest_id`        VARCHAR(36)           DEFAULT NULL,
  `name`            VARCHAR(255) NOT NULL,
  `type`            ENUM('adult','child') NOT NULL,
  `age`             INT                   DEFAULT NULL,
  `menu_preference` VARCHAR(50)  NOT NULL DEFAULT 'standard',
  `allergies`       JSON                  DEFAULT NULL,
  `allergies_other` VARCHAR(255)          DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `rsvp_attendees_rsvp_id_idx` (`rsvp_id`),
  INDEX `rsvp_attendees_guest_id_idx` (`guest_id`),
  CONSTRAINT `rsvp_attendees_rsvp_id_fkey`
    FOREIGN KEY (`rsvp_id`) REFERENCES `rsvp_responses` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `rsvp_attendees_guest_id_fkey`
    FOREIGN KEY (`guest_id`) REFERENCES `guests` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 4. uploads  (metadatos de Cloudinary)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `uploads` (
  `id`           VARCHAR(36)  NOT NULL,
  `created_at`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `file_url`     TEXT         NOT NULL,
  `file_type`    ENUM('image','video') NOT NULL,
  `file_name`    VARCHAR(255)          DEFAULT NULL,
  `storage_path` VARCHAR(500) NOT NULL,
  `thumb_url`    TEXT                  DEFAULT NULL,
  `user_name`    VARCHAR(255)          DEFAULT NULL,
  `guest_name`   VARCHAR(255)          DEFAULT NULL,
  `message`      TEXT                  DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `uploads_created_at_idx` (`created_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────
-- 5. Datos de ejemplo para guests (opcional — borra en producción)
-- ────────────────────────────────────────────────────────────
INSERT IGNORE INTO `guests` (`id`, `name`, `code`, `max_companions`, `email`) VALUES
  (UUID(), 'Ana García',        'ANA-001',    2, 'ana@example.com'),
  (UUID(), 'Carlos Martínez',   'CARLOS-002', 1, 'carlos@example.com'),
  (UUID(), 'Laura y Pedro',     'LAURA-003',  3, 'laura@example.com'),
  (UUID(), 'Familia Rodríguez', 'FAMILIA-004',4, NULL),
  (UUID(), 'María López',       'MARIA-005',  1, 'maria@example.com');

