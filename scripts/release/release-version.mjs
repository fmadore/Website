/** A release tag must describe the package embedded in the artifact. */
export function resolveReleaseVersion(
	packageVersion,
	{ input = '', refType = '', refName = '' } = {}
) {
	const version = input || (refType === 'tag' ? refName.replace(/^mcp-v/, '') : packageVersion);
	if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version))
		throw new Error(`Invalid release version: ${version}`);
	if (version !== packageVersion)
		throw new Error(
			`Release ${version} does not match mcp/package.json ${packageVersion}. Update the package before releasing.`
		);
	if (refType === 'tag' && refName !== `mcp-v${version}`)
		throw new Error('Release tag does not match the package version.');
	return version;
}
