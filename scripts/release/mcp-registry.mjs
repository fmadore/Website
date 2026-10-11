/**
 * The entry for the official MCP Registry (`mcp/server.json`), tied to one
 * released bundle.
 *
 * The registry holds metadata only. For an `mcpb` package that metadata points
 * at the GitHub Release asset and carries the SHA-256 of its bytes, which MCP
 * clients check before installing (https://modelcontextprotocol.io/registry/package-types).
 * The registry requires the URL to contain "mcp"; the release tag (`mcp-v…`)
 * and the `.mcpb` extension both do.
 */

export const REPOSITORY = 'https://github.com/fmadore/Website';
export const RELEASE_ASSET = 'frederickmadore-website.mcpb';
/** GitHub authentication publishes under the account's own namespace. */
export const NAMESPACE = 'io.github.fmadore/';

export const releaseUrl = (version) =>
	`${REPOSITORY}/releases/download/mcp-v${version}/${RELEASE_ASSET}`;

/** The entry for `version`, whose bundle hashes to `sha256`. */
export function stampServerJson(server, { version, sha256 }) {
	const [bundle, ...others] = server.packages ?? [];
	if (bundle?.registryType !== 'mcpb')
		throw new Error('server.json: the first package must be the mcpb bundle.');
	return {
		...server,
		version,
		packages: [{ ...bundle, identifier: releaseUrl(version), fileSha256: sha256 }, ...others]
	};
}

/**
 * What the registry would refuse, or what would make the entry describe some
 * other release than its own version. Schema limits are the 2025-12-11 ones.
 */
export function serverJsonProblems(server) {
	const problems = [];
	const check = (ok, message) => ok || problems.push(message);

	check(
		typeof server.name === 'string' &&
			server.name.startsWith(NAMESPACE) &&
			/^[a-zA-Z0-9.-]+\/[a-zA-Z0-9._-]+$/.test(server.name),
		`name must be ${NAMESPACE}<server>`
	);
	check(
		typeof server.description === 'string' &&
			server.description.length > 0 &&
			server.description.length <= 100,
		'description must be 1–100 characters'
	);
	check(
		server.title === undefined || (server.title.length > 0 && server.title.length <= 100),
		'title must be 1–100 characters'
	);
	check(/^\d+\.\d+\.\d+$/.test(server.version ?? ''), 'version must be a plain x.y.z');

	const bundle = server.packages?.[0];
	check(bundle?.registryType === 'mcpb', 'the first package must be registryType mcpb');
	if (bundle?.registryType === 'mcpb') {
		check(
			bundle.identifier === releaseUrl(server.version),
			`the bundle must be the release asset for ${server.version}: ${releaseUrl(server.version)}`
		);
		check(/mcp/.test(bundle.identifier ?? ''), 'the bundle URL must contain "mcp"');
		check(/^[a-f0-9]{64}$/.test(bundle.fileSha256 ?? ''), 'fileSha256 must be 64 hex digits');
		check(bundle.transport?.type === 'stdio', 'the bundle transport must be stdio');
	}
	return problems;
}
