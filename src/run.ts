import * as im from '@actions/exec/lib/interfaces'

export type ExecFn = (commandLine: string, args?: string[], options?: im.ExecOptions) => Promise<number>

type RegistryInfo = {
    url: string,
    password: string,
    username?: string,
}

function parseRegistryString(registryString: string): RegistryInfo | null {
    const parts = registryString.trim().split(/\s+/).filter(Boolean)
    if ([2, 3].includes(parts.length)) {
        return {
            url: parts[0],
            password: parts[1],
            username: parts.length === 3 ? parts[2] : undefined,
        }
    }
    return null
}

export default async function run(
    exec: ExecFn,
    core: {
        getInput: (key: string, opts?: { required: boolean }) => string,
        info: (...args: any[]) => void,
        debug: (...args: any[]) => void,
        setFailed: (message: string) => void,
        [k: string]: any,
    }
): Promise<any> {

    try {
        core.info('Starting Docker image build.')

        const registries = [
            core.getInput('registry'),
            core.getInput('registry1'),
            core.getInput('registry2'),
            core.getInput('registry3'),
            core.getInput('registry4'),
        ].filter(Boolean)

        if (registries.length === 0) {
            return core.setFailed('No registries specified (or key is empty).')
        }

        for (const registryString of registries) {

            core.debug(`Processing ${registryString}`)

            const registry = parseRegistryString(registryString)

            if (!registry) {
                return core.setFailed(`Invalid registry string: ${registryString}`)
            }

            await exec('docker', [
                'login',
                registry.username ? `-u=${registry.username}` : '',
                `-p=${registry.password}`,
                registry.url,
            ].filter(Boolean))
        }

    } catch (error) {

        core.setFailed(error.message)
    }
}
