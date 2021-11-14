SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `employees` (
    `employee_id` int(11) NOT NULL,
    `employee_name` varchar(100) NOT NULL,
    `employee_email` varchar(50) NOT NULL,
    `employee_password` varchar(255) NOT NULL,
    `employee_admin` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `admin` (
    `admin_id` int(11) NOT NULL,
    `admin_name` varchar(100) NOT NULL,
    `admin_mail` varchar(50) NOT NULL,
    `admin_password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `projects` (
    `pro_id` int(11) NOT NULL,
    `pro_title` varchar(300) NOT NULL,
    `pro_description` varchar(300) NOT NULL,
    `pro_employee_id` int(11) NOT NULL,
    `pro_state` boolean NOT NULL,
	
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `employees` (`employee_id`, `employee_name`, `employee_email`, `employee_password`,  `employee_admin`) VALUES
(1, 'Ernesto Zurbia', 'neto844@outlook.com', 'zurbianeto844',  1),
(2, 'Adrian Morales', 'chiniman1@outlook.com', 'pollos1',  1),
(3, 'Roberto Cruz', 'tank3-tk3@outlook.com', 'dovakhin1',  1);

INSERT INTO `admin` (`admin_id`, `admin_name`, `admin_mail`, `admin_password`) VALUES
(1, 'Sebastian Manzo', 'sebas_092100@outlook.com', '123');

ALTER TABLE `employees`
    ADD PRIMARY KEY (`employee_id`);

ALTER TABLE `admin`
    ADD PRIMARY KEY (`admin_id`);

ALTER TABLE `projects`
    ADD PRIMARY KEY (`pro_id`);

ALTER TABLE `employees`
    MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

ALTER TABLE `admin`
    MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `projects`
    MODIFY `pro_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

COMMIT;