# ************************************************************
# Sequel Ace SQL dump
# Version 20095
#
# https://sequel-ace.com/
# https://github.com/Sequel-Ace/Sequel-Ace
#
# Host: localhost (MySQL 8.0.27)
# Database: classmanager
# Generation Time: 2025-09-20 03:34:47 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
SET NAMES utf8mb4;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE='NO_AUTO_VALUE_ON_ZERO', SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table certificates
# ------------------------------------------------------------

CREATE TABLE `certificates` (
  `certificateID` int unsigned NOT NULL AUTO_INCREMENT,
  `fk_courseID` int unsigned NOT NULL DEFAULT '0',
  `fk_stateID` int unsigned NOT NULL,
  `certificateNumber` bigint unsigned NOT NULL DEFAULT '0',
  `maxCertificateNumber` bigint unsigned NOT NULL DEFAULT '0',
  `backupCertificateNumber` bigint DEFAULT NULL,
  `backupMaxCertificateNumber` bigint DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`certificateID`),
  UNIQUE KEY `fk_stateID` (`fk_stateID`),
  KEY `deletedAt` (`deletedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table classes
# ------------------------------------------------------------

CREATE TABLE `classes` (
  `classID` int unsigned NOT NULL AUTO_INCREMENT,
  `fk_schoolID` int DEFAULT NULL,
  `fk_locationID` int DEFAULT NULL,
  `fk_courseID` int unsigned NOT NULL,
  `fk_InstructorID` int DEFAULT NULL,
  `amountPaid` decimal(10,2) NOT NULL DEFAULT '0.00',
  `completionDate` date DEFAULT NULL,
  `notes` text,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`classID`),
  KEY `deletedAt` (`deletedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table classreasons
# ------------------------------------------------------------

CREATE TABLE `classreasons` (
  `classReasonID` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT '',
  `description` text,
  `isDefault` tinyint unsigned DEFAULT '0',
  `isCourtMandated` tinyint unsigned DEFAULT '1',
  `priority` int unsigned NOT NULL DEFAULT '0',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`classReasonID`),
  KEY `deletedAt` (`deletedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table counties
# ------------------------------------------------------------

CREATE TABLE `counties` (
  `countyID` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `isApproved` tinyint(1) NOT NULL DEFAULT '0',
  `fk_stateID` int unsigned NOT NULL DEFAULT '0',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`countyID`),
  KEY `fk_stateID` (`fk_stateID`),
  KEY `deletedAt` (`deletedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table courseproviders
# ------------------------------------------------------------

CREATE TABLE `courseproviders` (
  `courseProviderID` int unsigned NOT NULL AUTO_INCREMENT,
  `courseProviderNumber` varchar(10) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `addressLine1` varchar(255) DEFAULT NULL,
  `addressLine2` varchar(255) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `fk_stateID` int DEFAULT NULL,
  `zipCode` varchar(10) DEFAULT NULL,
  `phoneNumber` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `email` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `contactName` varchar(255) DEFAULT NULL,
  `perStudentFee` decimal(10,0) NOT NULL DEFAULT '10',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`courseProviderID`),
  KEY `deletedAt` (`deletedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table courses
# ------------------------------------------------------------

CREATE TABLE `courses` (
  `courseID` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` text,
  `isActive` tinyint NOT NULL DEFAULT '0',
  `priority` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`courseID`),
  KEY `deletedAt` (`deletedAt`),
  KEY `deletedAt_2` (`deletedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table deliverymethods
# ------------------------------------------------------------

CREATE TABLE `deliverymethods` (
  `deliveryMethodID` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `cost` decimal(10,2) NOT NULL DEFAULT '0.00',
  `priority` int NOT NULL DEFAULT '0',
  `isSpecialProcessing` tinyint(1) NOT NULL DEFAULT '0',
  `isDefault` tinyint NOT NULL DEFAULT '0',
  `emailRequired` tinyint NOT NULL DEFAULT '0',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`deliveryMethodID`),
  KEY `priority` (`priority`),
  KEY `deletedAt` (`deletedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table duplicatecertificates
# ------------------------------------------------------------

CREATE TABLE `duplicatecertificates` (
  `duplicateCertificateID` int unsigned NOT NULL AUTO_INCREMENT,
  `fk_studentID` int unsigned NOT NULL,
  `certificateNumber` varchar(50) DEFAULT NULL,
  `licenseNumber` varchar(50) DEFAULT NULL,
  `birthDate` date DEFAULT NULL,
  `phoneNumber` varchar(50) DEFAULT NULL,
  `fk_classReasonID` int unsigned DEFAULT NULL,
  `fk_ticketingStateID` int unsigned DEFAULT NULL,
  `fk_ticketingCountyID` int unsigned DEFAULT NULL,
  `fk_ticketingJurisdictionID` int unsigned DEFAULT NULL,
  `fk_duplicateReasonID` int unsigned DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`duplicateCertificateID`),
  KEY `fk_studentID` (`fk_studentID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;



# Dump of table duplicatereasons
# ------------------------------------------------------------

CREATE TABLE `duplicatereasons` (
  `duplicateReasonID` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`duplicateReasonID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table instructors
# ------------------------------------------------------------

CREATE TABLE `instructors` (
  `instructorID` int unsigned NOT NULL AUTO_INCREMENT,
  `lastName` varchar(50) DEFAULT NULL,
  `firstName` varchar(50) DEFAULT NULL,
  `addressLine1` varchar(255) DEFAULT NULL,
  `addressLine2` varchar(255) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `fk_stateID` int DEFAULT NULL,
  `zipCode` varchar(10) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `notes` text,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`instructorID`),
  KEY `lastName` (`lastName`,`firstName`),
  KEY `deletedAt` (`deletedAt`),
  KEY `deletedAt_2` (`deletedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table jurisdictions
# ------------------------------------------------------------

CREATE TABLE `jurisdictions` (
  `jurisdictionID` int unsigned NOT NULL AUTO_INCREMENT,
  `fk_countyID` int unsigned NOT NULL DEFAULT '0',
  `name` varchar(100) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `typeAbbreviation` varchar(6) DEFAULT NULL,
  `addressLine1` varchar(255) DEFAULT '',
  `addressLine2` varchar(255) DEFAULT '',
  `fk_stateID` int unsigned DEFAULT '0',
  `city` varchar(50) DEFAULT '',
  `zipCode` varchar(50) DEFAULT '',
  `phoneNumber` varchar(20) DEFAULT '',
  `contactInfo` text,
  `url` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`jurisdictionID`),
  KEY `fk_countyID` (`fk_countyID`),
  KEY `fk_stateID` (`fk_stateID`),
  KEY `deletedAt` (`deletedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table locations
# ------------------------------------------------------------

CREATE TABLE `locations` (
  `locationID` int unsigned NOT NULL AUTO_INCREMENT,
  `fk_schoolID` int unsigned NOT NULL DEFAULT '0',
  `number` varchar(3) NOT NULL DEFAULT '000',
  `name` varchar(255) DEFAULT NULL,
  `addressLine1` varchar(255) DEFAULT NULL,
  `addressLine2` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `fk_stateID` int NOT NULL,
  `zipCode` varchar(10) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`locationID`),
  KEY `deletedAt` (`deletedAt`),
  KEY `name` (`name`),
  KEY `number` (`number`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table packages
# ------------------------------------------------------------

CREATE TABLE `packages` (
  `packageID` int unsigned NOT NULL AUTO_INCREMENT,
  `fk_packageTypeID` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `shortDescription` varchar(255) DEFAULT NULL,
  `longDescription` text,
  `cost` decimal(10,2) NOT NULL DEFAULT '0.00',
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `packagedPrice` decimal(10,2) NOT NULL DEFAULT '0.00',
  `priority` int NOT NULL DEFAULT '0',
  `isDefault` int NOT NULL DEFAULT '0',
  `fk_deliveryMethodID` int NOT NULL DEFAULT '0',
  `fk_ticketingStateID` int NOT NULL DEFAULT '0',
  `isActive` tinyint NOT NULL DEFAULT '1',
  `displayColor` varchar(100) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`packageID`),
  KEY `fk_packageTypeID` (`fk_packageTypeID`,`isActive`),
  KEY `deletedAt` (`deletedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table packagetypes
# ------------------------------------------------------------

CREATE TABLE `packagetypes` (
  `packageTypeID` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`packageTypeID`),
  KEY `deletedAt` (`deletedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table schools
# ------------------------------------------------------------

CREATE TABLE `schools` (
  `schoolID` int unsigned NOT NULL AUTO_INCREMENT,
  `fk_courseProviderID` int unsigned DEFAULT '1',
  `fk_defaultLocationID` int unsigned DEFAULT NULL,
  `defaultDayOfWeek` smallint NOT NULL DEFAULT '1',
  `name` varchar(255) DEFAULT NULL,
  `shortName` varchar(20) DEFAULT NULL,
  `addressLine1` varchar(255) DEFAULT NULL,
  `addressLine2` varchar(255) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `fk_stateID` int DEFAULT NULL,
  `zipCode` varchar(10) DEFAULT NULL,
  `phoneNumber` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT '',
  `email` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `contactName` varchar(255) DEFAULT NULL,
  `notes` text,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`schoolID`),
  KEY `deletedAt` (`deletedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table states
# ------------------------------------------------------------

CREATE TABLE `states` (
  `stateID` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `abbreviation` char(2) DEFAULT NULL,
  `priority` int NOT NULL DEFAULT '99',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`stateID`),
  KEY `abbreviation` (`abbreviation`),
  KEY `priority` (`priority`),
  KEY `deletedAt` (`deletedAt`),
  KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table students
# ------------------------------------------------------------

CREATE TABLE `students` (
  `studentID` int unsigned NOT NULL AUTO_INCREMENT,
  `fk_schoolID` int unsigned NOT NULL,
  `fk_classID` int unsigned NOT NULL,
  `fk_classReasonID` int unsigned DEFAULT '0',
  `firstName` varchar(50) NOT NULL DEFAULT '',
  `middleInitial` varchar(1) DEFAULT NULL,
  `lastName` varchar(50) NOT NULL DEFAULT '',
  `addressLine1` varchar(255) NOT NULL DEFAULT '',
  `addressLine2` varchar(255) DEFAULT NULL,
  `fk_stateID` int unsigned NOT NULL DEFAULT '0',
  `city` varchar(50) NOT NULL DEFAULT '',
  `zipCode` varchar(10) NOT NULL DEFAULT '',
  `phoneNumber` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `licenseNumber` varchar(50) NOT NULL DEFAULT '',
  `fk_licenseStateID` int unsigned NOT NULL DEFAULT '0',
  `auditNumber` varchar(30) DEFAULT '' COMMENT 'Texas Specific ',
  `ssnLastFour` varchar(4) DEFAULT NULL,
  `birthDate` date NOT NULL,
  `dateCompleted` datetime DEFAULT NULL,
  `dateProcessed` datetime DEFAULT NULL,
  `finalGrade` int unsigned DEFAULT '0',
  `fk_ticketingStateID` int unsigned DEFAULT '0',
  `fk_ticketingCountyID` int unsigned DEFAULT '0',
  `fk_ticketingJurisdictionID` int unsigned DEFAULT '0',
  `certificateNumber` varchar(50) DEFAULT NULL,
  `trackingNumber` varchar(50) DEFAULT NULL,
  `trackingURL` varchar(255) DEFAULT NULL,
  `shippedEmailSent` tinyint unsigned DEFAULT '0',
  `fk_deliveryPackageID` int unsigned DEFAULT '0',
  `fk_drivingRecordPackageID` int unsigned DEFAULT '0',
  `fk_digitalCopyPackageID` int unsigned DEFAULT '0',
  `fee` decimal(10,2) DEFAULT '10.00',
  `notes` text CHARACTER SET latin1 COLLATE latin1_swedish_ci,
  `isPaid` tinyint NOT NULL DEFAULT '0',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`studentID`),
  KEY `fk_schoolID` (`fk_schoolID`),
  KEY `fk_stateID` (`fk_stateID`),
  KEY `fk_licenseStateID` (`fk_licenseStateID`),
  KEY `licenseNumber` (`licenseNumber`,`fk_schoolID`),
  KEY `emailpasswordschool` (`email`,`fk_schoolID`),
  KEY `updatedAt` (`updatedAt`),
  KEY `createdAt` (`createdAt`),
  KEY `deletedAt` (`deletedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table users
# ------------------------------------------------------------

CREATE TABLE `users` (
  `userID` int unsigned NOT NULL AUTO_INCREMENT,
  `fk_schoolID` int unsigned NOT NULL,
  `firstName` varchar(50) NOT NULL DEFAULT '',
  `lastName` varchar(50) NOT NULL DEFAULT '',
  `email` varchar(256) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL DEFAULT '',
  `password` varchar(60) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL DEFAULT '',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`userID`),
  UNIQUE KEY `fk_schoolid` (`fk_schoolID`,`email`),
  KEY `deletedAt` (`deletedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
