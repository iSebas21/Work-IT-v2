CREATE TABLE `admin` (
  `admin_id` int(11) NOT NULL,
  `admin_name` varchar(100) NOT NULL,
  `admin_mail` varchar(50) NOT NULL,
  `admin_password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `employees` (
  `employee_id` int(11) NOT NULL,
  `employee_name` varchar(100) NOT NULL,
  `employee_mail` varchar(50) NOT NULL,
  `employee_password` varchar(255) NOT NULL,
  `employee_admin` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 

CREATE TABLE `projects` (
  `pro_id` int(11) NOT NULL,
  `pro_title` varchar(300) NOT NULL,
  `pro_description` varchar(300) NOT NULL,
  `pro_employee_id` int(11) NOT NULL,
  `pro_state` tinyint(1) NOT NULL DEFAULT 0,
  `pro_admin` int(11) NOT NULL,
  `pro_limit` date NOT NULL,
  `pro_file` mediumblob DEFAULT NULL,
  `pro_msg` varchar(300) DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `admin`
  ADD PRIMARY KEY (`admin_id`);

ALTER TABLE `employees`
  ADD PRIMARY KEY (`employee_id`);

ALTER TABLE `projects`
  ADD PRIMARY KEY (`pro_id`);

ALTER TABLE `admin`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `employees`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

ALTER TABLE `projects`
  MODIFY `pro_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;
COMMIT;
