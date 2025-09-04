PRAGMA TablePathPrefix("/");

-- Interactions table to store JAICP call/chat results
CREATE TABLE interactions (
	interaction_id Utf8,
	channel Utf8,
	customer_phone Utf8,
	intent Utf8,
	result Utf8,
	sale Bool,
	amount Double,
	raw Json,
	created_at Timestamp,
	PRIMARY KEY (interaction_id)
);
