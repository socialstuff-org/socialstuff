CREATE TABLE socialstuff_user (
    id int auto_increment PRIMARY KEY,
    username_hash varchar(128),
    banned boolean
);

CREATE TABLE report_reason(
    id int auto_increment PRIMARY KEY,
    max_report_violations int
);

CREATE TABLE report (
    id int auto_increment PRIMARY KEY,
    user_id int,
    reason_id int
);

ALTER TABLE report ADD CONSTRAINT fk_user_id
    FOREIGN KEY (user_id) REFERENCES socialstuff_user(id);

ALTER TABLE report ADD CONSTRAINT fk_reason_id
    FOREIGN KEY (reason_id) REFERENCES report_reason(id);

