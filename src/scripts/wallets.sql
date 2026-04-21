CREATE TABLE IF NOT EXISTS wallets
(
    id bigint NOT NULL DEFAULT nextval('wallets_id_seq'::regclass),
    user_id integer NOT NULL,
    balance numeric(15,2) DEFAULT 0.00,
    currency character varying(3) COLLATE pg_catalog."default" DEFAULT 'PHP'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT wallets_pkey PRIMARY KEY (id),
    CONSTRAINT unique_user_wallet UNIQUE (user_id),
    CONSTRAINT fk_user FOREIGN KEY (user_id)
        REFERENCES users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)
