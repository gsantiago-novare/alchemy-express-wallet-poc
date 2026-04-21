
CREATE TABLE IF NOT EXISTS transactions
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    sender_wallet_id bigint,
    receiver_wallet_id bigint,
    amount numeric(15,2) NOT NULL,
    reference_no character varying(100) COLLATE pg_catalog."default" NOT NULL,
    status character varying(20) COLLATE pg_catalog."default" DEFAULT 'success'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT transactions_pkey PRIMARY KEY (id),
    CONSTRAINT transactions_reference_no_key UNIQUE (reference_no),
    CONSTRAINT transactions_receiver_wallet_id_fkey FOREIGN KEY (receiver_wallet_id)
        REFERENCES wallets (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT transactions_sender_wallet_id_fkey FOREIGN KEY (sender_wallet_id)
        REFERENCES wallets (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

CREATE INDEX IF NOT EXISTS idx_transactions_receiver
    ON transactions USING btree
    (receiver_wallet_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;


CREATE INDEX IF NOT EXISTS idx_transactions_sender
    ON transactions USING btree
    (sender_wallet_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;