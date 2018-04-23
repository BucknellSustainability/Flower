-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema energyhill
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema energyhill
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `energyhill` DEFAULT CHARACTER SET latin1 ;
USE `energyhill` ;

-- -----------------------------------------------------
-- Table `energyhill`.`alerts`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `energyhill`.`alerts` (
  `alertId` INT(11) NOT NULL AUTO_INCREMENT,
  `alertTime` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `handled` TINYINT(4) NULL DEFAULT '0',
  `sensorId` INT(11) NULL DEFAULT '1',
  `alertVal` DOUBLE NULL DEFAULT NULL,
  PRIMARY KEY (`alertId`),
  INDEX `sensorId_idx` (`sensorId` ASC))
ENGINE = InnoDB
AUTO_INCREMENT = 1928
DEFAULT CHARACTER SET = latin1;


-- -----------------------------------------------------
-- Table `energyhill`.`site`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `energyhill`.`site` (
  `siteId` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL DEFAULT NULL,
  `description` VARCHAR(200) NOT NULL DEFAULT ' ',
  `longitude` DOUBLE NULL DEFAULT NULL,
  `latitude` DOUBLE NOT NULL,
  `link` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`siteId`),
  UNIQUE INDEX `siteId_UNIQUE` (`siteId` ASC))
ENGINE = InnoDB
AUTO_INCREMENT = 10
DEFAULT CHARACTER SET = latin1;


-- -----------------------------------------------------
-- Table `energyhill`.`project`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `energyhill`.`project` (
  `projectId` INT(11) NOT NULL AUTO_INCREMENT,
  `siteId` INT(11) NULL DEFAULT '7',
  `name` VARCHAR(45) NULL DEFAULT NULL,
  `description` VARCHAR(200) NULL DEFAULT NULL,
  `isPrivate` TINYINT(1) NULL DEFAULT '1',
  `url` VARCHAR(100) NULL DEFAULT NULL,
  PRIMARY KEY (`projectId`),
  INDEX `siteId` (`siteId` ASC),
  CONSTRAINT `siteId`
    FOREIGN KEY (`siteId`)
    REFERENCES `energyhill`.`site` (`siteId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 55
DEFAULT CHARACTER SET = latin1;


-- -----------------------------------------------------
-- Table `energyhill`.`device`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `energyhill`.`device` (
  `deviceId` INT(11) NOT NULL AUTO_INCREMENT,
  `projectId` INT(11) NULL DEFAULT NULL,
  `name` VARCHAR(45) NULL DEFAULT NULL,
  `hardwareId` VARCHAR(128) NULL DEFAULT NULL,
  `discovered` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`deviceId`),
  INDEX `projectId_idx` (`projectId` ASC),
  CONSTRAINT `projectId`
    FOREIGN KEY (`projectId`)
    REFERENCES `energyhill`.`project` (`projectId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 16
DEFAULT CHARACTER SET = latin1;


-- -----------------------------------------------------
-- Table `energyhill`.`codeupload`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `energyhill`.`codeupload` (
  `uploadId` INT(11) NOT NULL AUTO_INCREMENT,
  `deviceId` INT(11) NOT NULL,
  `codePath` VARCHAR(100) NULL DEFAULT NULL,
  `handled` TINYINT(4) NULL DEFAULT '0',
  PRIMARY KEY (`uploadId`),
  INDEX `deviceId_idx` (`deviceId` ASC),
  INDEX `deviceId_codeupload_idx` (`deviceId` ASC),
  CONSTRAINT `deviceId_codeupload`
    FOREIGN KEY (`deviceId`)
    REFERENCES `energyhill`.`device` (`deviceId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 45
DEFAULT CHARACTER SET = latin1;


-- -----------------------------------------------------
-- Table `energyhill`.`sensor`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `energyhill`.`sensor` (
  `sensorId` INT(11) NOT NULL AUTO_INCREMENT,
  `deviceId` INT(11) NULL DEFAULT NULL,
  `units` VARCHAR(40) NULL DEFAULT NULL,
  `name` VARCHAR(40) NULL DEFAULT NULL,
  `description` VARCHAR(50) NULL DEFAULT NULL,
  `alertsEnabled` TINYINT(4) NULL DEFAULT NULL,
  `alertMinVal` DOUBLE NULL DEFAULT NULL,
  `alertMaxVal` DOUBLE NULL DEFAULT NULL,
  `minMsg` VARCHAR(75) NULL DEFAULT 'ALERT LOW',
  `maxMsg` VARCHAR(75) NULL DEFAULT 'ALERT HIGH',
  `displayName` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`sensorId`),
  INDEX `deviceId_idx` (`deviceId` ASC),
  CONSTRAINT `deviceId`
    FOREIGN KEY (`deviceId`)
    REFERENCES `energyhill`.`device` (`deviceId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 34
DEFAULT CHARACTER SET = latin1;


-- -----------------------------------------------------
-- Table `energyhill`.`data`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `energyhill`.`data` (
  `dataId` INT(11) NOT NULL AUTO_INCREMENT,
  `sensorId` INT(11) NOT NULL,
  `value` DOUBLE NOT NULL,
  `dateTime` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`dataId`),
  INDEX `sensorId_idx` (`sensorId` ASC),
  CONSTRAINT `sensorId`
    FOREIGN KEY (`sensorId`)
    REFERENCES `energyhill`.`sensor` (`sensorId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 11995591
DEFAULT CHARACTER SET = latin1;


-- -----------------------------------------------------
-- Table `energyhill`.`databuffer`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `energyhill`.`databuffer` (
  `dataId` INT(11) NOT NULL AUTO_INCREMENT,
  `sensorId` INT(11) NOT NULL,
  `value` DOUBLE NOT NULL,
  `dateTime` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`dataId`),
  INDEX `databuffer_sensorId_idx` (`sensorId` ASC),
  CONSTRAINT `databuffer_sensorId`
    FOREIGN KEY (`sensorId`)
    REFERENCES `energyhill`.`sensor` (`sensorId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1293666
DEFAULT CHARACTER SET = latin1;


-- -----------------------------------------------------
-- Table `energyhill`.`datahourly`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `energyhill`.`datahourly` (
  `sensorId` INT(11) NULL DEFAULT NULL,
  `averageValue` DOUBLE NULL DEFAULT NULL,
  `sampleRate` INT(11) NULL DEFAULT NULL,
  `dateTime` DATETIME NULL DEFAULT NULL)
ENGINE = InnoDB
DEFAULT CHARACTER SET = latin1;


-- -----------------------------------------------------
-- Table `energyhill`.`errors`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `energyhill`.`errors` (
  `errorId` INT(11) NOT NULL AUTO_INCREMENT,
  `deviceId` INT(11) NOT NULL,
  `path` VARCHAR(45) NULL DEFAULT NULL,
  `timestamp` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`errorId`),
  INDEX `deviceId_errors_idx` (`deviceId` ASC),
  CONSTRAINT `deviceId_errors`
    FOREIGN KEY (`deviceId`)
    REFERENCES `energyhill`.`device` (`deviceId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 20
DEFAULT CHARACTER SET = latin1;


-- -----------------------------------------------------
-- Table `energyhill`.`owners`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `energyhill`.`owners` (
  `userId` VARCHAR(50) NOT NULL,
  `projectId` INT(11) NOT NULL,
  INDEX `fk_owners_1_idx` (`projectId` ASC),
  INDEX `userId_idx` (`userId` ASC),
  CONSTRAINT `owners_projectId`
    FOREIGN KEY (`projectId`)
    REFERENCES `energyhill`.`project` (`projectId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = latin1;


-- -----------------------------------------------------
-- Table `energyhill`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `energyhill`.`user` (
  `userId` INT(32) NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(45) NULL DEFAULT NULL,
  `name` VARCHAR(45) NULL DEFAULT NULL,
  `approved` TINYINT(1) NULL DEFAULT '0',
  `googleId` VARCHAR(45) NULL DEFAULT NULL,
  `isAdmin` TINYINT(1) NULL DEFAULT '0',
  PRIMARY KEY (`userId`))
ENGINE = InnoDB
AUTO_INCREMENT = 43
DEFAULT CHARACTER SET = latin1;

USE `energyhill`;

DELIMITER $$
USE `energyhill`$$
CREATE
DEFINER=`energyhill`@`%`
TRIGGER `energyhill`.`datahourly_AFTER_INSERT`
AFTER INSERT ON `energyhill`.`datahourly`
FOR EACH ROW
BEGIN
    DECLARE _alertMinVal DOUBLE;
    DECLARE _alertMaxVal DOUBLE;
    DECLARE _alertsEnabled TINYINT;


SELECT alertMinVal, alertMaxVal, alertsEnabled
INTO _alertMinVal, _alertMaxVal, _alertsEnabled
FROM sensor
WHERE sensor.sensorId = new.sensorId;

IF((_alertsEnabled = 1) AND (_alertMaxVal <= new.averageValue OR _alertMinVal >= new.averageValue))
THEN INSERT INTO alerts (sensorId, alertVal) VALUES (new.sensorId, new.averageValue);
END IF;
END$$


DELIMITER ;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

