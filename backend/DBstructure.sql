-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 06, 2026 at 10:31 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `locagldatabase`
--

-- --------------------------------------------------------

--
-- Table structure for table `blog_posts`
--

CREATE TABLE `blog_posts` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `blog_posts`
--

INSERT INTO `blog_posts` (`id`, `title`, `content`, `image_path`, `created_at`) VALUES
(10, 'Stay informed. What\\\'s happening.', '<p><strong>PARLIAMENT OF KENYA</strong></p><p> <strong>THE SENATE</strong></p><p> <strong>SENATE BILLS DIGEST</strong></p><p><strong>THE COUNTY LIBRARY SERVICES BILL, 2024</strong></p><p><em>(SENATE BILLS NO. 40 OF 2024)</em></p><p><strong>Sponsor:</strong> Senator Joyce Korir</p><p> <strong>Date of Publication:</strong> 24th July, 2024</p><p> <strong>Date of First Reading:</strong> 17th September, 2024</p><p> <strong>Committee Referred to:</strong> Standing Committee on Labour and Social Welfare</p><p> <strong>Type of Bill:</strong> Ordinary Bill</p><p class=\\\"ql-align-center\\\">  </p><p><strong>1. Background</strong></p><p>Paragraph 4(f) of Part 2 of the Fourth Schedule to the Constitution assigns the function of cultural activities, public entertainment, and public amenities, including libraries, to counties.</p><p><strong>Current Law</strong></p><p> The Kenya National Library Service Board Act, Cap. 225, establishes the Kenya National Library Service Board and National Library Service but does not provide for the role and involvement of counties.</p><p>Further, by Legal Notice No. 142 of 9th August, 2019, pursuant to Section 15 of the Sixth Schedule to the Constitution, the Intergovernmental Relations Technical Committee (IGRTC) approved the delineation of library functions and distribution of libraries between the National Government and County Governments, with effect from 1st July, 2019.</p><p><strong>Rationale for the Bill</strong></p><p> The Bill seeks to provide for the establishment of county libraries in each county in line with Paragraph 4(f) of Part 2 of the Fourth Schedule to the Constitution.</p><p class=\\\"ql-align-center\\\">  </p><p><strong>2. Purpose of the Bill</strong></p><p>The principal object of the Bill is to promote the establishment and use of libraries in counties to facilitate access to information, improve education standards, and reduce levels of illiteracy in the counties.</p><p class=\\\"ql-align-center\\\">  </p><p><strong>3. Overview of the Legislative Proposal</strong></p><p><strong>Objective of the Bill</strong></p><p>The Bill aims to:</p><ul><li>Establish libraries in each county to ensure access to educational resources and information.</li><li>Promote literacy in counties.</li><li>Support education, cultural, and research activities by providing necessary resources and facilities.</li><li>Ensure the preservation of the cultural heritage of counties for future generations.</li></ul><p><strong>Roles of County Governments</strong></p><p>The Bill mandates county governments to:</p><ul><li>Approve and integrate the county libraries\\\' annual work plan into the annual county budget.</li><li>Mobilize resources necessary for the delivery of library services in the county.</li><li>Allocate adequate funds and resources for the effective development of libraries.</li><li>Collaborate with entities for capacity building, training programs for librarians, and mobilizing resources for library development.</li><li>Provide resources for the capacity building of county library staff.</li></ul><p><strong>Composition of a County Library Services Development Committee</strong></p><p>The Bill establishes a County Library Services Development Committee in each county, consisting of:</p><ul><li>The county executive committee member responsible for library services (chairperson).</li><li>Two distinguished academics appointed by the County Governor.</li><li>Two individuals with at least five years of experience in library services appointed by the County Governor.</li></ul><p><strong>Functions of the County Library Services Development Committee</strong></p><p>The committee will:</p><ul><li>Establish and promote the establishment of libraries in the county.</li><li>Develop, equip, manage, and maintain libraries, including electronic libraries.</li><li>Promote technology for accessing and disseminating information.</li><li>Provide information services responsive to community needs.</li><li>Advise the county government on the delivery of library services and related matters.</li><li>Facilitate the documentation of county-related information.</li><li>Train librarians within the county.</li><li>Encourage research in the development of library services.</li></ul><p><strong>Recognition of Other Libraries</strong></p><p>The committee may also recognize libraries run by voluntary agencies or public libraries as county libraries for the purpose of providing financial assistance.</p><p class=\\\"ql-align-center\\\">  </p><p><strong>4. Consequences of the Bill</strong></p><p>The Bill is expected to ensure that library services are easily accessible at the county level. It aligns with Paragraph 4(f) of Part 2 of the Fourth Schedule to the Constitution, which assigns the provision of library services to county governments.</p><p class=\\\"ql-align-center\\\">  </p><p><strong>5. Way Forward</strong></p><p><strong>Public Participation</strong></p><p>Pursuant to Senate Standing Order 145, the Standing Committee on Labour and Social Welfare will facilitate public participation and take into account public views and recommendations in its report to the Senate.</p><p><strong>Next Step</strong></p><p>The Bill was Read a First Time in the Senate on 17th September, 2024. The committee is required to submit its report to the Senate within 30 days of the Billâ€™s committal, by 17th October, 2024.</p><p><br></p><p>read moe: http://www.parliament.go.ke/the-senate/house-business/bills</p><p><br></p>', '../assets/img/Blogs/Stay_informed__What__s_happening__20240929_163442.jpg', '2024-09-29 16:34:42');

-- --------------------------------------------------------

--
-- Table structure for table `eventregcheckout`
--

CREATE TABLE `eventregcheckout` (
  `id` int(11) NOT NULL,
  `CheckoutRequestID` varchar(255) NOT NULL,
  `event_id` varchar(255) NOT NULL,
  `event_name` varchar(255) NOT NULL,
  `event_location` varchar(255) NOT NULL,
  `event_date` datetime NOT NULL,
  `email` varchar(255) NOT NULL,
  `member_name` varchar(255) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('Pending','Failed','Completed') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `eventregcheckout`
--

INSERT INTO `eventregcheckout` (`id`, `CheckoutRequestID`, `event_id`, `event_name`, `event_location`, `event_date`, `email`, `member_name`, `phone`, `amount`, `status`, `created_at`) VALUES
(0, 'ws_CO_13102024000056543748027123', '24', 'introduction to library tech', 'mombasa', '2024-10-08 00:00:00', 'maganaadmin@agl.or.ke', 'Alex Magana', '254748027123', 1.00, 'Pending', '2024-10-12 21:00:31'),
(0, 'ws_CO_13102024002314442748027123', '23', 'test test', 'mombasa', '2024-10-08 00:00:00', 'maganaalex634@gmail.com', 'Alex Magana', '254748027123', 1.00, 'Pending', '2024-10-12 21:23:15'),
(0, 'ws_CO_13102024115411462748027123', '24', 'introduction to library tech', 'mombasa', '2024-10-08 00:00:00', 'maganaalex634@gmail.com', 'Alex Magana', '254748027123', 1.00, 'Pending', '2024-10-13 08:53:45'),
(0, 'ws_CO_13102024141923439748027123', '22', 'alex 1', 'nairobi', '2024-10-08 00:00:00', 'maganaadmin@agl.or.ke', 'Alex Magana', '254748027123', 1.00, 'Pending', '2024-10-13 11:19:25'),
(0, 'ws_CO_13102024141949846748027123', '23', 'test test', 'mombasa', '2024-10-08 00:00:00', 'maganaadmin@agl.or.ke', 'Alex Magana', '254748027123', 1.00, 'Pending', '2024-10-13 11:19:51'),
(0, 'ws_CO_13102024142013760748027123', '23', 'test test', 'mombasa', '2024-10-08 00:00:00', 'maganaadmin@agl.or.ke', 'Alex Magana', '254748027123', 1.00, 'Pending', '2024-10-13 11:20:15'),
(0, 'ws_CO_13102024163801878748027123', '22', 'alex 1', 'nairobi', '2024-10-08 00:00:00', 'maganaalex@outlook.com', 'Alex Magana', '254748027123', 1.00, 'Pending', '2024-10-13 13:38:04'),
(0, 'ws_CO_18102024103849046748027123', '25', 'test test', 'mombasa', '2024-10-16 00:00:00', 'maganaadmin@agl.or.ke', 'alex magana', '254748027123', 1.00, 'Pending', '2024-10-18 07:38:49'),
(0, 'ws_CO_26102024105746020748027123', '26', '2024 AGM at Mombasa', 'Mombasa', '2024-10-27 00:00:00', 'maganaadmin@agl.or.ke', 'Alex Magana', '254748027123', 1.00, 'Pending', '2024-10-26 07:57:46'),
(0, 'ws_CO_26102024131704648748027123', '26', '2024 AGM at Mombasa', 'Mombasa', '2024-10-27 00:00:00', 'maganaadmin@agl.or.ke', 'Alex Magana', '254748027123', 1.00, 'Pending', '2024-10-26 10:17:05'),
(0, 'ws_CO_26102024131729178748027123', '26', '2024 AGM at Mombasa', 'Mombasa', '2024-10-27 00:00:00', 'maganaadmin@agl.or.ke', 'Alex Magana', '254748027123', 1.00, 'Pending', '2024-10-26 10:17:29'),
(0, 'ws_CO_26102024132324862748027123', '26', '2024 AGM at Mombasa', 'Mombasa', '2024-10-27 00:00:00', 'maganaadmin@agl.or.ke', 'Alex Magana', '254748027123', 1.00, 'Pending', '2024-10-26 10:23:25'),
(0, 'ws_CO_26102024132847247748027123', '26', '2024 AGM at Mombasa', 'Mombasa', '2024-10-27 00:00:00', 'maganaadmin@agl.or.ke', 'Alex Magana', '254748027123', 1.00, 'Pending', '2024-10-26 10:28:47'),
(0, 'ws_CO_26102024132920363748027123', '26', '2024 AGM at Mombasa', 'Mombasa', '2024-10-27 00:00:00', 'maganaadmin@agl.or.ke', 'Alex Magana', '254748027123', 1.00, 'Pending', '2024-10-26 10:29:20'),
(0, 'ws_CO_26102024133101828748027123', '27', 'test 2', 'nairobi', '2024-10-31 00:00:00', 'maganaadmin@agl.or.ke', 'Alex Magana', '254748027123', 1.00, 'Pending', '2024-10-26 10:31:02'),
(0, 'ws_CO_26102024133536718748027123', '28', 'ASSOCIATION OF GOVERNMENT', 'nairobi', '2024-10-23 00:00:00', 'maganaalex634@gmail.com', 'Alex Magana', '254748027123', 1.00, 'Pending', '2024-10-26 10:35:39');

-- --------------------------------------------------------

--
-- Table structure for table `event_registrations`
--

CREATE TABLE `event_registrations` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `event_name` varchar(255) NOT NULL,
  `event_location` varchar(255) NOT NULL,
  `event_date` date NOT NULL,
  `member_email` varchar(255) NOT NULL,
  `member_name` varchar(255) NOT NULL,
  `contact` varchar(50) NOT NULL,
  `registration_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `payment_code` varchar(255) NOT NULL,
  `invitation_card` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `event_registrations`
--




INSERT INTO `event_registrations` (`id`, `event_id`, `event_name`, `event_location`, `event_date`, `member_email`, `member_name`, `contact`, `registration_date`, `payment_code`, `invitation_card`) VALUES
(0, 13, 'AGL 2024 Annual Workshop', 'Tom Mboya Labour College-KISUMU', '2024-10-27', 'maganaalex634@gmail.com', ' Maglex Maglex Maglex Maglex Maglex Maglex Maglex Maglex Maglex', '254748027123', '2024-10-26 22:45:21', '00', NULL),
(0, 13, 'AGL 2024 Annual Workshop', 'Tom Mboya Labour College-KISUMU', '2024-10-27', 'maganaadmin@agl.or.ke', 'Alex Magana', '254748027123', '2024-10-26 22:47:48', '00', NULL),
(0, 31, 'The Future and Dynamics of Government  Libraries in Kenya', 'Plaza Beach Hotel Mombasa', '2025-03-23', 'maganaalex634@gmail.com', 'ALEX MAGANA', '254748027123', '2025-02-17 11:29:47', '00', NULL),
(0, 31, 'The Future and Dynamics of Government  Libraries in Kenya', 'Plaza Beach Hotel Mombasa', '2025-03-23', 'eugeneadmin@agl.or.ke', 'EUGENE MAKAU MUINDE', '254703689922', '2025-03-02 19:34:00', '00', NULL),
(0, 32, 'LIBRARIES OR AI? WHO STOLE WHO?', 'Tom Mboya Labour College-KISUMU', '2025-10-27', 'judymariita856@gmail.com', 'JUDY KEMUNTO MARIITA', '254716117316', '2025-10-01 09:14:49', '00', NULL),
(0, 31, 'The Future and Dynamics of Government  Libraries in Kenya', 'Plaza Beach Hotel Mombasa', '2025-03-23', 'judymariita856@gmail.com', 'JUDY KEMUNTO MARIITA', '254716117316', '2025-10-01 09:15:12', '00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--


CREATE TABLE `directmpesapayments` (
  `id` int(11) NOT NULL,
  `MerchantRequestID` varchar(100) NOT NULL,
  `CheckoutRequestID` varchar(100) NOT NULL,
  `ResultCode` int(11) NOT NULL,
  `ResultDesc` varchar(255) NOT NULL,
  `Amount` decimal(10,2) DEFAULT NULL,
  `MpesaReceiptNumber` varchar(50) DEFAULT NULL,
  `Balance` varchar(100) DEFAULT NULL,
  `TransactionDate` bigint(20) DEFAULT NULL,
  `PhoneNumber` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `account` varchar(100) DEFAULT NULL,
  `transactionCommited` varchar(20) NOT NULL DEFAULT 'notcommited'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `organisationinnermembers` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `motherOrganisationID` int(11) DEFAULT NULL,
  `motherOrganisationEmail` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `invoices` (
  `id` int(11) NOT NULL,
  `payment_description` varchar(255) NOT NULL,
  `amount_billed` decimal(10,2) NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `invoice_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `payment_description`, `amount_billed`, `amount_paid`, `user_email`, `invoice_date`) VALUES
(1, 'Membership Registration Payment', 2000.00, 1.00, 'maganaalex634@gmail.com', '2025-01-18 19:47:13'),
(2, 'Membership Premium Payment', 3600.00, 1.00, 'maganaalex634@gmail.com', '2025-01-18 19:48:58'),
(3, 'Membership Premium Payment', 3600.00, 1.00, 'maganaalex634@gmail.com', '2025-01-18 20:11:26'),
(4, 'Membership Premium Payment', 3599.00, 1.00, 'maganaalex634@gmail.com', '2025-01-18 20:12:58'),
(5, 'Membership Registration Payment', 2000.00, 1.00, 'maganaalex634@gmail.com', '2025-01-18 20:29:39'),
(6, 'Membership Registration Payment', 1999.00, 1.00, 'maganaalex634@gmail.com', '2025-01-18 20:39:17'),
(7, 'Membership Premium Payment', 3600.00, 1.00, 'Maganaalex634@outlook.com', '2025-01-19 10:42:42'),
(8, 'Membership Premium Payment', 0.00, 1.00, 'Maganaalex634@outlook.com', '2025-01-19 11:19:13'),
(9, 'Membership Premium Payment', 14998.00, 1.00, 'Maganaalex634@outlook.com', '2025-01-19 11:34:57'),
(10, 'Membership Premium Payment', 3598.00, 1.00, 'maganaalex634@gmail.com', '2025-01-19 11:44:42'),
(11, 'Membership Premium Payment', 14997.00, 1.00, 'Maganaalex634@outlook.com', '2025-01-19 12:07:20'),
(12, 'Membership Registration Payment', 3600.00, 1.00, 'samsonsophie14@gmail.com', '2025-09-16 12:48:43'),
(13, 'Membership Premium Payment', 3600.00, 3600.00, 'samsonsophie14@gmail.com', '2025-09-16 12:49:14'),
(14, 'Membership Registration Payment', 3600.00, 1.00, 'R.Kiilu@ombudsman.go.ke', '2025-09-29 06:36:47'),
(15, 'Membership Premium Payment', 3600.00, 1.00, 'maganaalex634@gmail.com', '2026-02-10 05:51:14');

-- --------------------------------------------------------

--
-- Table structure for table `membermessages`
--

CREATE TABLE `membermessages` (
  `id` int(11) NOT NULL,
  `sender_name` varchar(255) NOT NULL,
  `sender_email` varchar(255) NOT NULL,
  `recipient_group` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `date_sent` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `member_payments`
--

CREATE TABLE `member_payments` (
  `id` int(11) NOT NULL,
  `member_email` varchar(255) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `payment_code` varchar(50) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `member_payments`
--

INSERT INTO `member_payments` (`id`, `member_email`, `phone_number`, `payment_code`, `amount`, `timestamp`) VALUES
(23, 'maganaalex634@outlook.com', '254748027123', 'SKC3HCU1U3', 1.00, '2024-11-11 20:53:43'),
(24, 'maganaalex634@gmail.com', '254748027123', 'TAI4KXHKJU', 1.00, '2025-01-17 18:52:46'),
(25, 'maganaalex634@gmail.com', '254748027123', 'TAI0KXJYH2', 1.00, '2025-01-17 18:56:25'),
(26, 'maganaalex634@gmail.com', '254748027123', 'TAI0KY0CA4', 1.00, '2025-01-17 19:23:27'),
(27, 'maganaalex634@gmail.com', '254748027123', 'TAI0KY0CA4', 1.00, '2025-01-17 19:23:28'),
(28, 'maganaalex634@gmail.com', '254748027123', 'TAI4M3OD3O', 1.00, '2025-01-18 06:02:06'),
(29, 'maganaalex634@gmail.com', '254748027123', 'TAI4M3OD3O', 1.00, '2025-01-18 06:02:07'),
(30, 'maganaalex634@gmail.com', '254748027123', 'TAI9M72KYT', 1.00, '2025-01-18 06:26:22'),
(31, 'maganaalex634@gmail.com', '254748027123', 'TAI3M7A4P5', 1.00, '2025-01-18 06:27:50'),
(32, 'maganaalex634@gmail.com', '254748027123', 'TAI2NIFG1Y', 1.00, '2025-01-18 11:42:14'),
(33, 'maganaalex634@gmail.com', '254748027123', 'TAI5NL1IK7', 1.00, '2025-01-18 11:56:19'),
(34, 'maganaalex634@gmail.com', '254748027123', 'TAI5NL1IK7', 1.00, '2025-01-18 11:56:20'),
(35, 'maganaalex634@gmail.com', '254748027123', 'TAI8NNXZ54', 1.00, '2025-01-18 12:12:03'),
(36, 'maganaalex634@gmail.com', '254748027123', 'TAI2NQBFT8', 1.00, '2025-01-18 12:24:32'),
(37, 'maganaalex634@gmail.com', '254748027123', 'TAI8NQRP1Q', 1.00, '2025-01-18 12:26:53'),
(38, 'maganaalex634@gmail.com', '254748027123', 'TAI6NRDV4I', 1.00, '2025-01-18 12:30:00'),
(39, 'maganaalex634@gmail.com', '254748027123', 'TAI8NRQXLS', 1.00, '2025-01-18 12:31:54'),
(40, 'maganaalex634@gmail.com', '254748027123', 'TAI8NS8KYA', 1.00, '2025-01-18 12:34:22'),
(41, 'maganaalex634@gmail.com', '254748027123', 'TAI2NUYRZ8', 1.00, '2025-01-18 12:47:56'),
(42, 'maganaalex634@gmail.com', '254748027123', 'TAJ0P9H2VQ', 1.00, '2025-01-18 19:20:57'),
(43, 'maganaalex634@gmail.com', '254748027123', 'TAJ3P9TZWN', 1.00, '2025-01-18 19:42:31'),
(44, 'maganaalex634@gmail.com', '254748027123', 'TAJ3P9TZWN', 1.00, '2025-01-18 19:42:32'),
(45, 'maganaalex634@gmail.com', '254748027123', 'TAJ7P9W0D3', 1.00, '2025-01-18 19:47:13'),
(46, 'maganaalex634@gmail.com', '254748027123', 'TAJ2P9WYWU', 1.00, '2025-01-18 19:48:58'),
(47, 'maganaalex634@gmail.com', '254748027123', 'TAJ6PA8BRK', 1.00, '2025-01-18 20:11:26'),
(48, 'maganaalex634@gmail.com', '254748027123', 'TAJ8PA8TQ0', 1.00, '2025-01-18 20:12:58'),
(49, 'maganaalex634@gmail.com', '254748027123', 'TAJ8PAGHSW', 1.00, '2025-01-18 20:29:39'),
(50, 'maganaalex634@gmail.com', '254748027123', 'TAJ4PAKREI', 1.00, '2025-01-18 20:39:17'),
(51, 'Maganaalex634@outlook.com', '254748027123', 'TAJ5RCOK07', 1.00, '2025-01-19 10:42:42'),
(52, 'Maganaalex634@outlook.com', '254748027123', 'TAJ8RIC85I', 1.00, '2025-01-19 11:19:13'),
(53, 'Maganaalex634@outlook.com', '254748027123', 'TAJ0RKSY74', 1.00, '2025-01-19 11:34:57'),
(54, 'maganaalex634@gmail.com', '254748027123', 'TAJ8RMBSSM', 1.00, '2025-01-19 11:44:42'),
(55, 'Maganaalex634@outlook.com', '254748027123', 'TAJ5RQ2K9V', 1.00, '2025-01-19 12:07:20'),
(56, 'samsonsophie14@gmail.com', '254714392065', 'TIG77IJ1E3', 1.00, '2025-09-16 12:48:43'),
(57, 'samsonsophie14@gmail.com', '254714392065', 'TIG47IOO4M', 3600.00, '2025-09-16 12:49:14'),
(58, 'R.Kiilu@ombudsman.go.ke', '254714785917', 'TITMF5Z5J6', 1.00, '2025-09-29 06:36:47'),
(59, 'maganaalex634@gmail.com', NULL, 'UBA796805Z', 1.00, '2026-02-10 05:51:14');

-- --------------------------------------------------------

--
-- Table structure for table `member_premium_payments`
--

CREATE TABLE `member_premium_payments` (
  `id` int(11) NOT NULL,
  `member_email` varchar(255) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `payment_code` varchar(50) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `member_premium_payments`
--

INSERT INTO `member_premium_payments` (`id`, `member_email`, `phone_number`, `payment_code`, `amount`, `timestamp`) VALUES
(0, 'maganaalex634@gmail.com', '254748027123', 'TAJ6PA8BRK', 1.00, '2025-01-18 20:11:26'),
(0, 'maganaalex634@gmail.com', '254748027123', 'TAJ8PA8TQ0', 1.00, '2025-01-18 20:12:58'),
(0, 'Maganaalex634@outlook.com', '254748027123', 'TAJ5RCOK07', 1.00, '2025-01-19 10:42:42'),
(0, 'Maganaalex634@outlook.com', '254748027123', 'TAJ8RIC85I', 1.00, '2025-01-19 11:19:13'),
(0, 'Maganaalex634@outlook.com', '254748027123', 'TAJ0RKSY74', 1.00, '2025-01-19 11:34:57'),
(0, 'maganaalex634@gmail.com', '254748027123', 'TAJ8RMBSSM', 1.00, '2025-01-19 11:44:42'),
(0, 'Maganaalex634@outlook.com', '254748027123', 'TAJ5RQ2K9V', 1.00, '2025-01-19 12:07:20'),
(0, 'samsonsophie14@gmail.com', '254714392065', 'TIG47IOO4M', 3600.00, '2025-09-16 12:49:14'),
(0, 'maganaalex634@gmail.com', NULL, 'UBA796805Z', 1.00, '2026-02-10 05:51:14');

-- --------------------------------------------------------

--
-- Table structure for table `member_registration_payments`
--

CREATE TABLE `member_registration_payments` (
  `id` int(11) NOT NULL,
  `member_email` varchar(255) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `payment_code` varchar(50) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `member_registration_payments`
--

INSERT INTO `member_registration_payments` (`id`, `member_email`, `phone_number`, `payment_code`, `amount`, `timestamp`) VALUES
(0, 'maganaalex634@gmail.com', '254748027123', 'TAJ8PAGHSW', 1.00, '2025-01-18 20:29:39'),
(0, 'maganaalex634@gmail.com', '254748027123', 'TAJ4PAKREI', 1.00, '2025-01-18 20:39:17'),
(0, 'samsonsophie14@gmail.com', '254714392065', 'TIG77IJ1E3', 1.00, '2025-09-16 12:48:43'),
(0, 'R.Kiilu@ombudsman.go.ke', '254714785917', 'TITMF5Z5J6', 1.00, '2025-09-29 06:36:47');

-- --------------------------------------------------------

--
-- Table structure for table `mpesa_transactions`
--

CREATE TABLE `mpesa_transactions` (
  `CheckoutRequestID` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `transaction_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `mpesa_transactions`
--

INSERT INTO `mpesa_transactions` (`CheckoutRequestID`, `email`, `phone`, `amount`, `status`, `transaction_date`) VALUES
('ws_CO_01022025154453622748027123', 'maganaalex634@gmail.com', '254748027123', 3600.00, 'Pending', '2025-02-01 12:44:54'),
('ws_CO_01032025220920639748027123', 'maganaalex634@gmail.com', '254748027123', 3600.00, 'Pending', '2025-03-01 19:09:21'),
('ws_CO_07012025173226563748027123', 'maganaalex634@gmail.com', '254748027123', 3600.00, 'Pending', '2025-01-07 14:32:27'),
('ws_CO_08062025005431126748027123', 'maganaalex634@gmail.com', '254748027123', 3600.00, 'Pending', '2025-06-07 21:54:31'),
('ws_CO_08062025005603206748027123', 'maganaalex634@gmail.com', '254748027123', 3600.00, 'Pending', '2025-06-07 21:56:03'),
('ws_CO_08062025192511171748027123', 'maganaalex634@gmail.com', '254748027123', 3600.00, 'Pending', '2025-06-08 16:25:11'),
('ws_CO_10012025072558132717807516', 'maganaalex634@gmail.com', '254717807516', 3600.00, 'Pending', '2025-01-10 04:25:58'),
('ws_CO_10022026112254557748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2026-02-10 08:22:54'),
('ws_CO_10022026115103760748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2026-02-10 08:51:04'),
('ws_CO_12112024025336230748027123', 'maganaalex634@outlook.com', '254748027123', 1.00, 'Pending', '2024-11-11 23:53:36'),
('ws_CO_13122024102725937748027123', 'maganaalex634@gmail.com', '254748027123', 3600.00, 'Pending', '2024-12-13 07:27:27'),
('ws_CO_15052025083407979748027123', 'maganaalex634@gmail.com', '254748027123', 3600.00, 'Pending', '2025-05-15 05:34:08'),
('ws_CO_16092025184800189714392065', 'samsonsophie14@gmail.com', '254714392065', 1.00, 'Pending', '2025-09-16 15:48:00'),
('ws_CO_16092025184801792714392065', 'samsonsophie14@gmail.com', '254714392065', 1.00, 'Pending', '2025-09-16 15:48:01'),
('ws_CO_16092025184830138714392065', 'samsonsophie14@gmail.com', '254714392065', 1.00, 'Pending', '2025-09-16 15:48:30'),
('ws_CO_16092025184903796714392065', 'samsonsophie14@gmail.com', '254714392065', 3600.00, 'Pending', '2025-09-16 15:49:04'),
('ws_CO_17102024162241704748027123', 'Maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2024-10-17 13:22:43'),
('ws_CO_17102024162303987748027123', 'Maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2024-10-17 13:23:04'),
('ws_CO_1752350142043748027123', 'maganaalex634@gmail.com', '254748027123', 3600.00, 'Pending', '2025-07-12 19:55:42'),
('ws_CO_1753692085939704227125', 'maganaalex634@gmail.com', '254704227125', 3600.00, 'Pending', '2025-07-28 08:41:26'),
('ws_CO_18012025005238580748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2025-01-17 21:52:38'),
('ws_CO_18012025005615282748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2025-01-17 21:56:15'),
('ws_CO_18012025012320032748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2025-01-17 22:23:20'),
('ws_CO_18012025120157905748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2025-01-18 09:01:58'),
('ws_CO_18012025122139571748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2025-01-18 09:21:39'),
('ws_CO_18012025122614111748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2025-01-18 09:26:14'),
('ws_CO_18012025122718865748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2025-01-18 09:27:19'),
('ws_CO_18012025122744833748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2025-01-18 09:27:45'),
('ws_CO_18012025174207437748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2025-01-18 14:42:08'),
('ws_CO_18012025175610336748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2025-01-18 14:56:10'),
('ws_CO_18012025181149534748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2025-01-18 15:11:49'),
('ws_CO_18012025182423748748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2025-01-18 15:24:24'),
('ws_CO_18012025182503682748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2025-01-18 15:25:04'),
('ws_CO_18012025182645325748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2025-01-18 15:26:45'),
('ws_CO_18012025182948484748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2025-01-18 15:29:49'),
('ws_CO_18012025183142782748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2025-01-18 15:31:43'),
('ws_CO_18012025183414020748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2025-01-18 15:34:14'),
('ws_CO_18012025184750066748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2025-01-18 15:47:50'),
('ws_CO_18102024104143945748027123', 'maganaadmin@agl.or.ke', '254748027123', 1.00, 'Pending', '2024-10-18 07:41:44'),
('ws_CO_18102024105059031725358733', 'maganaadmin@agl.or.ke', '254725358733', 2000.00, 'Pending', '2024-10-18 07:50:59'),
('ws_CO_18102024105218372725418950', 'maganaadmin@agl.or.ke', '254725418950', 2000.00, 'Pending', '2024-10-18 07:52:18'),
('ws_CO_18102024115634240748027123', 'maganaadmin@agl.or.ke', '254748027123', 2000.00, 'Pending', '2024-10-18 08:56:34'),
('ws_CO_18102024115858611748027123', 'maganaadmin@agl.or.ke', '254748027123', 3600.00, 'Pending', '2024-10-18 08:58:58'),
('ws_CO_19012025012049247748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2025-01-18 22:20:49'),
('ws_CO_19012025014217942748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2025-01-18 22:42:18'),
('ws_CO_19012025014704860748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2025-01-18 22:47:05'),
('ws_CO_19012025014751645748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2025-01-18 22:47:51'),
('ws_CO_19012025014850138748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2025-01-18 22:48:50'),
('ws_CO_19012025021114397748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2025-01-18 23:11:14'),
('ws_CO_19012025021251223748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2025-01-18 23:12:51'),
('ws_CO_19012025022926833748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2025-01-18 23:29:27'),
('ws_CO_19012025023903431748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2025-01-18 23:39:03'),
('ws_CO_19012025164110498748027123', 'Maganaalex634@outlook.com', '254748027123', 3600.00, 'Pending', '2025-01-19 13:41:11'),
('ws_CO_19012025164234669748027123', 'Maganaalex634@outlook.com', '254748027123', 1.00, 'Pending', '2025-01-19 13:42:35'),
('ws_CO_19012025171901746748027123', 'Maganaalex634@outlook.com', '254748027123', 1.00, 'Pending', '2025-01-19 14:19:02'),
('ws_CO_19012025173449495748027123', 'Maganaalex634@outlook.com', '254748027123', 1.00, 'Pending', '2025-01-19 14:34:49'),
('ws_CO_19012025174432624748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2025-01-19 14:44:32'),
('ws_CO_19012025180712048748027123', 'Maganaalex634@outlook.com', '254748027123', 1.00, 'Pending', '2025-01-19 15:07:12'),
('ws_CO_19012025183923623798462224', 'Maganaalex634@outlook.com', '254798462224', 15000.00, 'Pending', '2025-01-19 15:39:27'),
('ws_CO_19122024100700940722918040', 'josphat.ndambuki@gmail.com', '254722918040', 3600.00, 'Pending', '2024-12-19 07:07:05'),
('ws_CO_21102024181445839798462224', 'Maganaalex634@gmail.com', '254798462224', 3600.00, 'Pending', '2024-10-21 15:14:46'),
('ws_CO_21102024220136955748027123', 'maganaalex634@outlook.com', '254748027123', 1.00, 'Pending', '2024-10-21 19:01:37'),
('ws_CO_22032025214450262748027123', 'maganaalex634@gmail.com', '254748027123', 3600.00, 'Pending', '2025-03-22 18:44:50'),
('ws_CO_23092024105331026748027123', 'maganaadmin@agl.or.ke', '254748027123', 1.00, 'Pending', '2024-09-23 07:53:45'),
('ws_CO_23092024105350660748027123', 'maganaadmin@agl.or.ke', '254748027123', 1.00, 'Pending', '2024-09-23 07:53:33'),
('ws_CO_25102024130649271748027123', 'maganaadmin@agl.or.ke', '254748027123', 2000.00, 'Pending', '2024-10-25 10:06:49'),
('ws_CO_25102024130759137748027123', 'maganaadmin@agl.or.ke', '254748027123', 3600.00, 'Pending', '2024-10-25 10:08:04'),
('ws_CO_25102024130829881748027123', 'maganaadmin@agl.or.ke', '254748027123', 3600.00, 'Pending', '2024-10-25 10:08:30'),
('ws_CO_25102024181420221748027123', 'maganaadmin@agl.or.ke', '254748027123', 3600.00, 'Pending', '2024-10-25 15:14:20'),
('ws_CO_25102024181444031748027123', 'maganaadmin@agl.or.ke', '254748027123', 3600.00, 'Pending', '2024-10-25 15:14:44'),
('ws_CO_25102024182046629748027123', 'maganaadmin@agl.or.ke', '254748027123', 2000.00, 'Pending', '2024-10-25 15:20:46'),
('ws_CO_25102024192436762748027123', 'maganaadmin@agl.or.ke', '254748027123', 2000.00, 'Pending', '2024-10-25 16:24:37'),
('ws_CO_26092024232817021748027123', 'maganaadmin@agl.or.ke', '254748027123', 1.00, 'Pending', '2024-09-26 20:27:58'),
('ws_CO_26092024233413003748027123', 'maganaadmin@agl.or.ke', '254748027123', 1.00, 'Pending', '2024-09-26 20:34:15'),
('ws_CO_26102024195253672748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2024-10-26 16:52:54'),
('ws_CO_26102024231510881748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2024-10-26 20:15:11'),
('ws_CO_26102024231548511748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2024-10-26 20:15:48'),
('ws_CO_27102024003722536748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2024-10-26 21:37:23'),
('ws_CO_27102024005402059748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2024-10-26 21:54:02'),
('ws_CO_27102024005432452748027123', 'maganaalex634@gmail.com', '254748027123', 1.00, 'Pending', '2024-10-26 21:54:32'),
('ws_CO_27102024023115465748027123', 'maganaadmin@agl.or.ke', '254748027123', 3600.00, 'Pending', '2024-10-26 23:31:15'),
('ws_CO_28102024001241593728730634', 'maganaadmin@agl.or.ke', '254728730634', 3600.00, 'Pending', '2024-10-27 21:12:41'),
('ws_CO_29012026095117289748027123', 'maganaalex634@gmail.com', '254748027123', 3600.00, 'Pending', '2026-01-29 06:51:16'),
('ws_CO_29092025123638204714785917', 'R.Kiilu@ombudsman.go.ke', '254714785917', 1.00, 'Pending', '2025-09-29 09:36:39'),
('ws_CO_29102024151917825722386969', 'maganaadmin@agl.or.ke', '254722386969', 3600.00, 'Pending', '2024-10-29 12:19:19'),
('ws_CO_30012025121554553722854506', 'jenteriki@gmail.com', '254722854506', 3600.00, 'Pending', '2025-01-30 09:15:54'),
('ws_CO_30102024162848339748027123', 'maganaadmin@agl.or.ke', '254748027123', 3600.00, 'Pending', '2024-10-30 13:28:48'),
('ws_CO_30112024184053100748027123', 'maganaalex634@gmail.com', '254748027123', 3600.00, 'Pending', '2024-11-30 15:40:54');

-- --------------------------------------------------------

--
-- Table structure for table `officialmessages`
--

CREATE TABLE `officialmessages` (
  `id` int(11) NOT NULL,
  `sender_name` varchar(255) NOT NULL,
  `sender_email` varchar(255) NOT NULL,
  `recipient_group` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `date_sent` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `officialsmembers`
--

CREATE TABLE `officialsmembers` (
  `id` int(11) NOT NULL,
  `personalmembership_email` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `number_of_terms` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `officialsmembers`
--

INSERT INTO `officialsmembers` (`id`, `personalmembership_email`, `position`, `start_date`, `number_of_terms`) VALUES
(0, 'Maganaalex634@gmail.com', 'admin', '2024-10-09', 1),
(0, '1.joashsan@gmail.com', 'CHAIRPERSON', '2023-01-01', 1),
(0, '1.joashsan@gmail.com', 'Chairman', '2023-03-01', 1),
(0, '1.joashsan@gmail.com', 'Chair Person', '2024-11-23', 2);

-- --------------------------------------------------------

--
-- Table structure for table `organizationmembership`
--

CREATE TABLE `organizationmembership` (
  `id` varchar(15) NOT NULL,
  `organization_name` varchar(255) NOT NULL,
  `organization_email` varchar(255) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `logo_image` varchar(255) DEFAULT NULL,
  `contact_phone_number` varchar(20) DEFAULT NULL,
  `date_of_registration` date DEFAULT NULL,
  `organization_address` text DEFAULT NULL,
  `location_country` varchar(100) DEFAULT NULL,
  `location_county` varchar(100) DEFAULT NULL,
  `location_town` varchar(100) DEFAULT NULL,
  `registration_certificate` varchar(255) DEFAULT NULL,
  `organization_type` varchar(100) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `what_you_do` text DEFAULT NULL,
  `payment_Number` varchar(50) DEFAULT NULL,
  `payment_code` varchar(50) DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `organizationmembership`
--

INSERT INTO `organizationmembership` (`id`, `organization_name`, `organization_email`, `contact_person`, `logo_image`, `contact_phone_number`, `date_of_registration`, `organization_address`, `location_country`, `location_county`, `location_town`, `registration_certificate`, `organization_type`, `start_date`, `what_you_do`, `payment_Number`, `payment_code`, `payment_date`, `password`, `created_at`) VALUES
('admin', 'MAGLEX', 'Maganaalex634@outlook.com', 'Alex Magana', '../assets/img/MembersProfile/orgMembers/Maganaalex634@gmail.com_1731367498.png', '0748027123', '2024-11-05', '1072', 'Kenya', 'Meru', 'Meru', '../assets/Documents/orgMembersDocuments/Maganaalex634@gmail.com_1731367498.pdf', 'non governmental', '2024-11-12', 'IT services', '254748027123', 'SKC3HCU1U3', '2024-11-11', '$2y$10$dmucvziLvOQ1meFa9UdYc.Mq7rQ9QZR2lfU4gCAvU4yQ9ZkKYY0Ue', '2024-11-11 23:24:58');

-- --------------------------------------------------------

--
-- Table structure for table `pastevents`
--

CREATE TABLE `pastevents` (
  `id` int(11) NOT NULL,
  `event_name` varchar(255) NOT NULL,
  `event_details` text NOT NULL,
  `event_location` varchar(255) NOT NULL,
  `event_date` date NOT NULL,
  `event_image_paths` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`event_image_paths`)),
  `event_document_paths` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`event_document_paths`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pastevents`
--

INSERT INTO `pastevents` (`id`, `event_name`, `event_details`, `event_location`, `event_date`, `event_image_paths`, `event_document_paths`, `created_at`) VALUES
(11, 'AGL 10th Annual General Meeting', '&lt;p&gt;&lt;strong&gt;The AGL 10th Conference/Annual General Meeting Report&lt;/strong&gt; highlights the discussions and outcomes of the 2020 meeting held from &lt;strong&gt;March 9th to 14th in Kisumu&lt;/strong&gt;. The event brought together &lt;strong&gt;72 participants&lt;/strong&gt;, including &lt;strong&gt;librarians&lt;/strong&gt; and &lt;strong&gt;records managers&lt;/strong&gt; from &lt;strong&gt;national&lt;/strong&gt; and &lt;strong&gt;county governments&lt;/strong&gt;, to discuss the role of information professionals in promoting government policies.&lt;/p&gt;&lt;p&gt;&lt;strong&gt;Key Sections of the Report:&lt;/strong&gt;&lt;/p&gt;&lt;p&gt;&lt;strong&gt;1. Objectives:&lt;/strong&gt;&lt;/p&gt;&lt;ul&gt;&lt;li&gt;&lt;strong&gt;Foster collaboration&lt;/strong&gt; among information professionals from various government sectors.&lt;/li&gt;&lt;li&gt;&lt;strong&gt;Establish standards&lt;/strong&gt; for professional practices in library and information management.&lt;/li&gt;&lt;li&gt;&lt;strong&gt;Promote the role&lt;/strong&gt; of information professionals in advancing government policies.&lt;/li&gt;&lt;/ul&gt;&lt;p&gt;&lt;strong&gt;2. Chairmanâ€™s Report:&lt;/strong&gt;&lt;/p&gt;&lt;ul&gt;&lt;li&gt;Review of the associationâ€™s &lt;strong&gt;activities and successes&lt;/strong&gt;, including past workshops.&lt;/li&gt;&lt;li&gt;Highlighted challenges such as &lt;strong&gt;financial constraints&lt;/strong&gt; and the need for broader &lt;strong&gt;publicity and awareness&lt;/strong&gt; of AGL&#039;s mission.&lt;/li&gt;&lt;/ul&gt;&lt;p&gt;&lt;strong&gt;3. Presentations:&lt;/strong&gt;&lt;/p&gt;&lt;p&gt;Covered a wide range of topics including:&lt;/p&gt;&lt;ul&gt;&lt;li&gt;&lt;strong&gt;Information Ethics in Libraries and Records Management&lt;/strong&gt; by Ramadhan Wesonga.&lt;/li&gt;&lt;li&gt;&lt;strong&gt;Marketing Government Information Services&lt;/strong&gt; by Dr. Duncan Amoth.&lt;/li&gt;&lt;li&gt;&lt;strong&gt;Effects of Government Policies on Libraries&lt;/strong&gt; by Rachel M. Nyaga.&lt;/li&gt;&lt;li&gt;&lt;strong&gt;Knowledge Management&lt;/strong&gt; by Dr. Rose Gathi, emphasizing the importance of knowledge sharing within organizations.&lt;/li&gt;&lt;li&gt;&lt;strong&gt;Collection Development in Libraries&lt;/strong&gt; by Joseph Mboji.&lt;/li&gt;&lt;/ul&gt;&lt;p&gt;&lt;strong&gt;4. Challenges and Resolutions:&lt;/strong&gt;&lt;/p&gt;&lt;ul&gt;&lt;li&gt;Issues such as &lt;strong&gt;financial instability&lt;/strong&gt;, member engagement, and the need for &lt;strong&gt;professional development&lt;/strong&gt; were discussed.&lt;/li&gt;&lt;li&gt;Proposals were made to increase &lt;strong&gt;digital communication&lt;/strong&gt;, create more awareness of AGL, and foster partnerships with sponsors.&lt;/li&gt;&lt;/ul&gt;&lt;p&gt;&lt;strong&gt;5. Treasurer&#039;s Report:&lt;/strong&gt;&lt;/p&gt;&lt;p&gt;The financial report outlined the association&#039;s &lt;strong&gt;income and expenditures&lt;/strong&gt;, showing a balance of &lt;strong&gt;Ksh. 583,788&lt;/strong&gt; at the end of 2019.&lt;/p&gt;&lt;p&gt;The meeting concluded with the adoption of several resolutions aimed at improving &lt;strong&gt;library services&lt;/strong&gt; and enhancing the &lt;strong&gt;professional development&lt;/strong&gt; of members.&lt;/p&gt;&lt;p&gt;&lt;br&gt;&lt;/p&gt;&lt;p&gt;read more from the full report.....&lt;/p&gt;', 'KISUMU HOTEL, KISUMU', '2020-11-09', '[\"..\\/assets\\/img\\/PastEvents\\/1728855363_AGL_10th_Annual_General_Meeting_img_0.jpg\"]', '[\"..\\/assets\\/Documents\\/PastEventsDocs\\/1728855363_AGL_10th_Annual_General_Meeting_doc_0.pdf\"]', '2024-10-13 21:36:04');

-- --------------------------------------------------------

--
-- Table structure for table `personalmembership`
--

CREATE TABLE `personalmembership` (
  `id` varchar(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `home_address` text DEFAULT NULL,
  `passport_image` varchar(255) NOT NULL,
  `highest_degree` varchar(100) NOT NULL,
  `institution` varchar(255) NOT NULL,
  `graduation_year` int(11) NOT NULL,
  `completion_letter` varchar(255) NOT NULL,
  `profession` varchar(100) NOT NULL,
  `experience` int(11) NOT NULL,
  `current_company` varchar(255) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `work_address` text DEFAULT NULL,
  `payment_Number` varchar(50) NOT NULL,
  `payment_code` varchar(100) DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `registration_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `gender` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `personalmembership`
--

INSERT INTO `personalmembership` (`id`, `name`, `email`, `phone`, `home_address`, `passport_image`, `highest_degree`, `institution`, `graduation_year`, `completion_letter`, `profession`, `experience`, `current_company`, `position`, `work_address`, `payment_Number`, `payment_code`, `payment_date`, `password`, `registration_date`, `gender`) VALUES
('admin1', 'ALEX MAGANA', 'maganaalex634@gmail.com', '0748027123', '1072', '../assets/img/MembersProfile/maganaalex634@gmail.com_1733510997.jpg', 'Degree', 'St Pauls University', 2024, '../assets/Documents/MembersDocuments/maganaadmin@agl.or.ke_1730788146.pdf', 'Computer Science major', 3, 'Admin', 'Admin', '1072', '254748027123', 'TAJ4PAKREI', '2025-01-18', '$2y$10$HXbddV.SQMA.6hrfnT4IwOHN2PQ2kOQZSZxnJmVjzdqEl/VkOFsVy', '2024-10-02 15:27:15', 'Male'),
('admin2', 'EUGENE MAKAU MUINDE', 'eugeneadmin@agl.or.ke', '0703689922', '35010 00100', '../assets/img/MembersProfile/eugenemakauadmin@agl.or.ke_1729070627.jpeg', 'Degree', 'MOI UNIVERSITY MAIN CAMPUS', 2024, '../assets/Documents/MembersDocuments/eugenemakauadmin@agl.or.ke_1729070627.pdf', 'INFORMATION SCIENTIST', 4, 'ADMIN', 'AGL', '+254703689922', '', NULL, NULL, '$2y$10$oR5DMcbY8PoIBdrseO4SSOVNruuPJmHWGNvVDJVdysGZzT0NI/zmq', '2024-10-16 09:23:47', 'Male'),
('AGL/0001', 'JOASH AMINGA', '1.joashsan@gmail.com', '0722605048', '74434,00200', '../assets/img/MembersProfile/1.joashsan@gmail.com_1731910672.jpg', 'Degree', 'MOI UNIVERSITY MAIN CAMPUS', 2012, '../assets/Documents/MembersDocuments/1.joashsan@gmail.com_1731910672.pdf', 'INFORMATION PROFESSIONAL', 25, 'EXECUTIVE OFFICE OF THE DEPUTY PRESIDENT', 'EXECUTIVE OFFICE OF THE DEPUTY PRESIDENT', '74434,00200', '', NULL, NULL, '$2y$10$qPF/x3kkU01GbxXk0V9c4.b/NSf0vqV1.5Z9G18.LvEUa5K5btqeq', '2024-11-18 06:17:52', 'Male'),
('AGL/0002', 'Zuwena Chebet Cheruon', 'zchebet@kcaa.or.ke', '+254722502533', 'P.O Box 30163-00100                                                                    Nairobi, Kenya.                                                      Aviation House JKIA', '../assets/img/MembersProfile/zchebet@kcaa.or.ke_1730230920.jpg', 'Degree', 'Moi University', 2011, '../assets/Documents/MembersDocuments/zchebet@kcaa.or.ke_1730230920.pdf', 'Librarian', 15, 'Kenya Civil Aviation Authority', 'Technical Librarian', 'P.O Box 30163-00100                                             Nairobi Kenya\r\nAviation House-HQ JKIA', '', NULL, NULL, '$2y$10$USXUiQiwzu23UUGfWTroMuURO34z1bYPaSavCrRwxoQNevwcrorKS', '2024-10-29 19:42:00', 'Female'),
('AGL/0003', 'Mathew Nzuki', 'mmnzuki@gmail.com', '254727493402', 'Box 30163 - 00200 Nairobi', '../assets/img/MembersProfile/mmnzuki@gmail.com_1734425499.png', 'Degree', 'Kenyatta University', 2022, '../assets/Documents/MembersDocuments/mmnzuki@gmail.com_1734425499.pdf', 'Librarian', 16, 'East African School of Aviation - A training directorate of KCAA', 'Kenya Civil Aviation Authority', '30163 - 00200 Nairobi', '', NULL, NULL, '$2y$10$8dmK/Y2N3Ag0oujS0e7.Gubt6Ezl0dMyfA2cg3r1M1D.51uaLJIbO', '2024-12-17 08:51:39', 'Male'),
('AGL/0004', 'NICHOLAS OTIENO HONGO', 'nickyz2014@gmail.com', '254714762802', '209-00618', '../assets/img/MembersProfile/nickyz2014@gmail.com_1734508117.jpg', 'Degree', 'KENYATTA UNIVERSITY', 2013, '../assets/Documents/MembersDocuments/nickyz2014@gmail.com_1734508117.pdf', 'LIBRARIAN', 11, 'DIRECTORATE OF PUBLIC PROSECUTIONS', 'LIBRARIAN/RECORDS MANAGEMENT OFFICER', 'ODPP House,\r\nRagati Road, Upper Hill.\r\nP.O. Box 30701-00100.\r\nNairobi, Kenya', '', NULL, NULL, '$2y$10$fT3D.U2syE9TYJOVVGe5Ue0zF74jyeQwva8/q/qMSuxYj.8G8nyEG', '2024-12-18 07:48:37', 'Male'),
('AGL/0005', 'Josphat Ndambuki', 'josphat.ndambuki@gmail.com', '0722918040', '74434 00200', '../assets/img/MembersProfile/josphat.ndambuki@gmail.com_1734591745.jpeg', 'Degree', 'Techinical University of Kenya', 2014, '../assets/Documents/MembersDocuments/josphat.ndambuki@gmail.com_1734591745.pdf', 'Librarian', 10, 'Office of The Deputy President', 'Librarian 1', '74434 00200', '', NULL, NULL, '$2y$10$i0IRWWZNwBMCJcE9Z5jgbexjAgF43RoPQ3iH7v6wc0TuFQFm7ZbuG', '2024-12-19 07:02:25', 'Male'),
('AGL/0006', 'Solomon Theuri Kimani', 'solotheuri@yahoo.com', '254722582102', '35728-00200', '../assets/img/MembersProfile/solotheuri@yahoo.com_1735811791.png', 'Degree', 'Anjarwalla &amp; Khanna LLP', 2011, '../assets/Documents/MembersDocuments/solotheuri@yahoo.com_1735811791.pdf', 'Knowledge Management', 18, 'Anjarwalla &amp; Khanna LLP', 'Knowledge Management officer', '200-00600 ALN House, Eldama Ravine Close, Off Eldama Ravine Road, Westlands, Nairobi, Kenya', '', NULL, NULL, '$2y$10$sw78y4Ixo24uJUZL3YV1PuoG1y.dePrx42Dbs32IRXpG49xXaZrsC', '2025-01-02 09:56:31', 'Male'),
('AGL/0007', 'Mercy Jeruto Osiri', 'jerutoosiri@gmail.com', '254720654054', '48994-00100 NAIROBI', '../assets/img/MembersProfile/jerutoosiri@gmail.com_1736498363.jpg', 'Degree', 'Moi University', 2014, '../assets/Documents/MembersDocuments/jerutoosiri@gmail.com_1736498363.pdf', 'Librarianship', 15, 'National Council for Population and Development', 'Principal Information and Documentation Officer', 'The Chancery Building, 4th floor, Valley Road, P.O. Box 48994-00100 Nairobi', '', NULL, NULL, '$2y$10$IJsPfW1rveaOktiqI6P9HeabEIM2Lh.k5zbc9p8Mt04FIyZ0JLeJa', '2025-01-10 08:39:23', 'Female'),
('AGL/0008', 'Stephen Odemba', 'stephenodemba95@gmail.com', '254722657565', '34 - 80300', '../assets/img/MembersProfile/stephenodemba95@gmail.com_1736502373.jpg', 'Diploma', 'Rongo university', 2017, '../assets/Documents/MembersDocuments/stephenodemba95@gmail.com_1736502373.pdf', 'LIBRARIAN', 6, 'TAITA TAVETA NATIONAL POLYTECHNIC', 'ASSISTANT LIBRARIAN', '34- 80300', '', NULL, NULL, '$2y$10$zb0M.gXGCP9Bmlw5.m9kQuUwki8QY0O0XVGWjmabYspvczYZJLc.2', '2025-01-10 09:46:13', 'Male'),
('AGL/0009', 'Jennifer Barmosho', 'jenteriki@gmail.com', '0722854506', '40530 00100', '../assets/img/MembersProfile/jenteriki@gmail.com_1738228390.jpg', 'Degree', 'University of South Afrika', 2009, '../assets/Documents/MembersDocuments/jenteriki@gmail.com_1738228390.pdf', 'Librarian', 22, 'Presidency', 'Assistant Director library services', 'State House', '', NULL, NULL, '$2y$10$SqgX5HCSvqfqjugreNTfl.iHQ6vp2N/GdG2l8S36c8ufeXSOGkXTG', '2025-01-30 09:13:10', 'Female'),
('AGL/0010', 'Naomi Macharia', 'naomacharia@gmail.com', '254710281930', 'P.0 Box 30046-00100\r\nNairobi, Kenya', '../assets/img/MembersProfile/naomacharia@gmail.com_1739867256.jpg', 'Degree', 'Makerere University', 2009, '../assets/Documents/MembersDocuments/naomacharia@gmail.com_1739867256.pdf', 'Principal Librarian', 12, 'State Department for Lands and Physical Planning', 'State Department for Lands and Physical Planning', '30450-00100 Nairobi', '', NULL, NULL, '$2y$10$/sJJako68FhZIE2ZuBVkUem68IYD5d3/xssRgNDunD9QQQx4Ufwlq', '2025-02-18 08:27:37', 'Female'),
('AGL/0011', 'Mary Amisi Okalo', 'okalomary@gmail.com ', '0723908350', '03, Emuhaya', '../assets/img/MembersProfile/okalomary@gmail.com_1742466624.png', 'Diploma', 'Sigalagala Technical Training Institute', 1999, '../assets/Documents/MembersDocuments/okalomary@gmail.com_1742466624.pdf', 'Librarian', 21, 'ministry of gender culture the arts and heritage', 'Principle  Library Assistant', '49849-00100, Nairobi-KNLS Building', '', NULL, NULL, '$2y$10$RtHxx9dAcsKYwwQWlPxgsuTPwqV.IrWOyQ6Gvt/YJnxB2gfjcTYF6', '2025-03-20 10:30:24', 'Female'),
('AGL/0012', 'Joseph Mboji', 'jmboji@gmail.com', '0722384239', '5529-00100 Nairobi', '../assets/img/MembersProfile/jmboji@gmail.com_1742467205.jpg', 'Masters', 'Moi University', 2023, '../assets/Documents/MembersDocuments/jmboji@gmail.com_1742467205.jpg', 'Librarian', 30, 'ministry of agriculture and livestock development', 'Deputy Director, Library Services', '5529-00100 Nairobi', '', NULL, NULL, '$2y$10$aWqjvPwvXh0pLsUpg4akIOTqVC14KBZPZLlPybluiHH90PKjif5EC', '2025-03-20 10:40:05', 'Male'),
('AGL/0013', 'MERCYLINE BIYAKI NYAKONI', 'biyaki480@gmail.com', '254711347478', 'P.O BOX 8847-00200', '../assets/img/MembersProfile/biyaki480@gmail.com_1743074963.jpg', 'Degree', 'moi university', -1, '../assets/Documents/MembersDocuments/biyaki480@gmail.com_1743074963.pdf', 'llibrarian Assistant', 15, 'TECHNICAL LIBRARY', 'KPLC-IESR', 'P.O box 30099-00100', '', NULL, NULL, '$2y$10$p9K6GY9u8g49Klqoa30wUe/Cgv4TsGEpxazo60WqxBVtPBf./jzF2', '2025-03-27 11:29:23', 'Female'),
('AGL/0014', 'DANIELLA WATHOME', 'daniella.wathome@gmail.com', '0720959489', '58130-00200 NAIROBI', '../assets/img/MembersProfile/daniella.wathome@gmail.com_1749822073.jpg', 'Degree', 'MOI UNIVERSITY', 2015, '../assets/Documents/MembersDocuments/daniella.wathome@gmail.com_1749822073.pdf', 'LIBRARIAN', 20, 'MINISTRY OF INTERIOR AND NATIONAL ADMINISTRATION', 'HoD LIBRARY', '30510-00100 NAIROBI', '', NULL, NULL, '$2y$10$SIoy8d4nwHq3JEKRgTbY8Oh40IcUoJp3.8zvscdPsZaHAFEkUOLhC', '2025-06-13 13:41:13', 'Female'),
('AGL/0015', 'lydia makena mwiti', 'makenamwiti31@gmail.com', '254724723625', '14 Meru', '../assets/img/MembersProfile/makenamwiti31@gmail.com_1754642380.jpg', 'Diploma', 'inter global institute embu', 2013, '../assets/Documents/MembersDocuments/makenamwiti31@gmail.com_1754642380.pdf', 'library assistant', 11, 'mount Kenya university', 'mount Kenya university', 'meru', '', NULL, NULL, '$2y$10$wWIQM1azwca9gdY3FST2iumv4.SiFDt8/aQPB/SnF4v75s2iPN5.W', '2025-08-08 08:39:40', 'Female'),
('AGL/0016', 'RUTH KITUNGE KIILU', 'R.Kiilu@ombudsman.go.ke', '254714785913', 'West End Towers, 2nd Floor, Waiyaki Way\r\nP.O Box 20414-00200, Nairobi', '../assets/img/MembersProfile/R.Kiilu@ombudsman.go.ke_1754983473.jpeg', 'Degree', 'Moi University', 2016, '../assets/Documents/MembersDocuments/R.Kiilu@ombudsman.go.ke_1754983473.pdf', 'LIBRARIAN', 10, 'THE COMMISSION ON ADMINISTRATIVE JUSTICE (OFFICE OF THE OMBUDSMAN)', 'LIBRARIAN II', 'West End Towers, 2nd Floor, Waiyaki Way \r\nP.O BOX 20414-00200, NAIROBI\r\nTEL: 020 2270000', '254714785917', 'TITMF5Z5J6', '2025-09-29', '$2y$10$72IU1pVI/GyZD.ITcv3HEePPKsFvy/MsjEKWUecwFN7ujkigM3IYW', '2025-08-12 07:24:33', 'Female'),
('AGL/0017', 'Sophie Auma Ouma', 'samsonsophie14@gmail.com', '0714392065', '401073', '../assets/img/MembersProfile/samsonsophie14@gmail.com_1758037566.jpg', 'Diploma', 'Intraglobal Training Institute', 2018, '../assets/Documents/MembersDocuments/samsonsophie14@gmail.com_1758037566.jpg', 'Records Management Officer', 15, 'Ministry of Foreign Affairs', 'Records Management Officer 1- Library unit', 'State Department of Foreign Affairs', '254714392065', 'TIG77IJ1E3', '2025-09-16', '$2y$10$/wGJQaS4oU3PX43bgZC7FuuyjinLWq7yo.Hy/5bT5MxR29dLNZ8S2', '2025-09-16 15:46:06', 'Female'),
('AGL/0018', 'JUDY KEMUNTO MARIITA', 'judymariita856@gmail.com', '254716117316', 'N/A', '../assets/img/MembersProfile/judymariita856@gmail.com_1759309983.jpg', 'Degree', 'KENYATTA UNIVERSITY', 2017, '../assets/Documents/MembersDocuments/judymariita856@gmail.com_1759309983.pdf', 'LIBRARIAN', 5, 'KENYA POWER', 'LIBRARIAN', 'N/A', '', NULL, NULL, '$2y$10$lrejOpXY13RMX6SSEGxKP.yyWneKbGHwbZZ10q7Q/dTUrVVoxfSiO', '2025-10-01 09:13:03', 'Female'),
('AGL/0019', 'STANLEY OCHIENG OUMA', 'stanleyouma4@gmail.com', '0791984152', '40', '../assets/img/MembersProfile/stanleyouma4@gmail.com_1768673219.jpg', 'Degree', 'LAIKIPIA UNIVERSITY', 2022, '../assets/Documents/MembersDocuments/stanleyouma4@gmail.com_1768673219.pdf', 'Bachelor of Library and Information Studies (Information Technology Option)', 1, 'N/A', 'SYSTEMS LIBRARIAN AT THE OPEN UNIVERSITY OF KENYA', 'N/A', '', NULL, NULL, '$2y$10$1HQUCtJMawz/4DlBKHP.COl.0Gf/MLC756hfaYY54O/NnweAm6ICa', '2026-01-17 18:06:59', 'Male'),
('AGL/0020', 'Joel Sintamei Pose', 'jpose@knbs.or.ke', '0742850527', 'P.O.BOX 30266-0100', '../assets/img/MembersProfile/jpose@knbs.or.ke_1770606895.jpg', 'Degree', 'Chuka University', 2022, '../assets/Documents/MembersDocuments/jpose@knbs.or.ke_1770606895.pdf', 'Librarian', 3, 'KENYA NATIONAL BUREAU OF STATISTICS', 'KENYA NATIONAL BUREAU OF STATISTICS', 'P.O.BOX 30266-0100', '', NULL, NULL, '$2y$10$jQrXsGQjqgrbbFBRxQ3NceVMd1eKSaPK2YmmNyVNhHECdM3bO1ejy', '2026-02-09 03:14:55', 'Male'),
('AGL/0021', 'Sharon Chepkemoi', 'chepkemoisharon333@gmail.com', '254704318525', 'Box 20, chesinende', '../assets/img/MembersProfile/chepkemoisharon333@gmail.com_1772176059.jpg', 'Diploma', 'Kenya Highlands university', 2019, '../assets/Documents/MembersDocuments/chepkemoisharon333@gmail.com_1772176059.jpg', 'Librarian', 3, 'Directorate of Criminal Investigation', 'Librarian, National criminal investigation academy', 'P. O. Box. 30036-00100,Nairobi , Kenya', '', NULL, NULL, '$2y$10$mmJOVJJGJt/0B8tDBoXhu.lk6j6dyGkhD5e/ley93o8vhPEiCRFfm', '2026-02-27 07:07:39', 'Female');

-- --------------------------------------------------------

--
-- Table structure for table `plannedevent`
--

CREATE TABLE `plannedevent` (
  `id` int(11) NOT NULL,
  `event_name` varchar(255) NOT NULL,
  `event_image_path` varchar(255) NOT NULL,
  `event_description` text NOT NULL,
  `event_location` varchar(255) NOT NULL,
  `event_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `RegistrationAmount` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `plannedevent`
--

INSERT INTO `plannedevent` (`id`, `event_name`, `event_image_path`, `event_description`, `event_location`, `event_date`, `created_at`, `RegistrationAmount`) VALUES
(31, 'The Future and Dynamics of Government  Libraries in Kenya', '../assets/img/PlannedEvent/1739791768_The_Future_and_Dynamics_of_Government__Libraries_in_Kenya.jpg', '<p>The event will be held from the 23rd of March to the 29th of March, 2025.</p>', 'Plaza Beach Hotel Mombasa', '2025-03-23', '2025-02-17 11:29:28', 0.00),
(32, 'LIBRARIES OR AI? WHO STOLE WHO?', '../assets/img/PlannedEvent/1758789145_LIBRARIES_OR_AI?_WHO_STOLE_WHO?.png', '<p><strong>INTRODUCTION</strong></p><p><br /></p><p>The rapid rise of Artificial Intelligence (AI) is reshaping how societies create, share, and consume knowledge. Librariesâ€”long considered custodians of cultural memory and gateways to knowledgeâ€”are now positioned at the crossroads of tradition and technology.</p><p>This forum asks the central question:</p><p> <strong>â€œLibraries or AIâ€”who stole what from who?â€</strong></p><p>It explores the cultural, ethical, and professional dimensions of managing information in the digital age. With Africaâ€™s diverse knowledge systems at risk, the dialogue aims to highlight opportunities for <strong>collaboration, preservation, and innovation.</strong></p><p><br /></p><h3><strong>Objectives</strong></h3><ul><li><strong>Examine the role of libraries and librarians</strong> in shaping cultural representation in the AI era.</li><li><strong>Explore how AI bridges or widens cultural and knowledge gaps,</strong> with a focus on African contexts.</li><li><strong>Position libraries as strategic actors</strong> in knowledge management, talent retention, and cultural memory preservation.</li><li><strong>Engage professionals on wellness and ethics</strong> as foundational pillars for the future of information work.</li></ul><p><br /></p><h3><strong>Why Attend</strong></h3><ul><li>Gain fresh insights into the intersection of <strong>AI, libraries, and African cultural identity.</strong></li><li>Explore practical approaches to <strong>bridging digital and cultural divides.</strong></li><li>Learn strategies for managing knowledge while prioritizing <strong>ethics, wellness, and professional growth.</strong></li><li>Participate in an open dialogue on <strong>whose stories are told, preserved, and transformed</strong> in the AI era.</li></ul><p><br /></p><p><br /></p><h3><strong>Subthemes</strong></h3><ul><li>African Cultural Information in AI (Open Forum)</li><li>Transformational Libraries and Librarians</li><li>AI for All: Bridging Cultural Gaps through Intelligence</li><li>Libraries as Cultural Mediators in the AI Era</li><li>Whose Story Gets Told? AI, Bias, and Cultural Representation in Libraries</li><li>Knowledge Management: Strategic Approaches to Future Challenges and Talent Retention</li><li>Libraries as Creators and Curators of Information</li><li>Story Keepers: Libraries as Cultural Memory Banks</li><li>Wellness: Mental Health and Nutrition</li><li>Professional Ethics in the Information World</li></ul><p><br /></p><p><br /></p><p><br /></p><p><br /></p><p><br /></p><p><br /></p><p><br /></p>', 'Tom Mboya Labour College-KISUMU', '2025-10-27', '2025-09-25 08:32:25', 0.00);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `membermessages`
--
ALTER TABLE `membermessages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `member_payments`
--
ALTER TABLE `member_payments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mpesa_transactions`
--
ALTER TABLE `mpesa_transactions`
  ADD PRIMARY KEY (`CheckoutRequestID`);

--
-- Indexes for table `officialmessages`
--
ALTER TABLE `officialmessages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `organizationmembership`
--
ALTER TABLE `organizationmembership`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organization_email` (`organization_email`);

--
-- Indexes for table `pastevents`
--
ALTER TABLE `pastevents`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `personalmembership`
--
ALTER TABLE `personalmembership`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `plannedevent`
--
ALTER TABLE `plannedevent`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `blog_posts`
--
ALTER TABLE `blog_posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `membermessages`
--
ALTER TABLE `membermessages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `member_payments`
--
ALTER TABLE `member_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `officialmessages`
--
ALTER TABLE `officialmessages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `pastevents`
--
ALTER TABLE `pastevents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `plannedevent`
--
ALTER TABLE `plannedevent`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
