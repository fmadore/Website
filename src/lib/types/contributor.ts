/**
 * A credited name, optionally linked to the people registry. Keep the name on
 * the record: a historical byline must not change when a person's profile does.
 * Legacy strings remain valid while records acquire verified person links.
 */
export type Contributor =
	string | { name: string; personId?: string; kind?: 'person' | 'organisation' };
