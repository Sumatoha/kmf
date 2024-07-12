CREATE TABLE R_CURRENCY (
                            ID INT PRIMARY KEY IDENTITY,
                            TITLE VARCHAR(60) NOT NULL,
                            CODE VARCHAR(3) NOT NULL,
                            VALUE NUMERIC(18,2) NOT NULL,
                            A_DATE DATE NOT NULL
);