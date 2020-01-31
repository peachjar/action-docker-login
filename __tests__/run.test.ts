import run, { ExecFn } from '../src/run'

describe('Run function', () => {

    let exec: ExecFn
    let core: {
        getInput: (key: string, opts?: { required: boolean }) => string,
        debug: (...args: any[]) => void,
        info: (...args: any[]) => void,
        setFailed: (message: string) => void,
        [k: string]: any,
    }

    beforeEach(() => {
        exec = jest.fn(() => Promise.resolve(0))
        core = {
            getInput: jest.fn((key: string) => {
                switch (key) {
                    // Yes, extra spacing is intentional
                    case 'registry': return 'docker.pkg.github.com abc1234 foobar'
                    case 'registry2': return ' quay.io  password yomama '
                    case 'registry3': return 'index.docker.io/v1/  hiphop   hurray'
                    case 'registry4': return 'reg.example.com tokentokentoken'
                    default: return ''
                }
            }),
            debug: jest.fn(),
            info: jest.fn(),
            setFailed: jest.fn()
        }
    })

    describe('when registries are supplied to the action', () => {
        it('should log into each one', async () => {
            await run(exec, core)
            expect(exec).toHaveBeenCalledWith('docker', [
                'login', '-u=foobar', '-p=abc1234', 'docker.pkg.github.com',
            ])
            expect(exec).toHaveBeenCalledWith('docker', [
                'login', '-u=yomama', '-p=password', 'quay.io',
            ])
            expect(exec).toHaveBeenCalledWith('docker', [
                'login', '-u=hurray', '-p=hiphop', 'index.docker.io/v1/',
            ])
            expect(exec).toHaveBeenCalledWith('docker', [
                'login', '-p=tokentokentoken', 'reg.example.com',
            ])
            expect(core.setFailed).not.toHaveBeenCalled()
        })
    })

    describe('when a registry string is invalid', () => {

        beforeEach(() => {
            core.getInput = jest.fn((key: string) => {
                switch (key) {
                    case 'registry': return 'docker.pkg.github.com abc1234 foobar'
                    case 'registry2': return 'quay.io'
                    default: return ''
                }
            })
        })

        it('should fail the action', async () => {
            await run(exec, core)
            expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining('quay.io'))
        })
    })

    describe('when there are no registries supplied', () => {

        beforeEach(() => {
            core.getInput = jest.fn((key: string) => '')
        })

        it('should fail the action', async () => {
            await run(exec, core)
            expect(core.setFailed).toHaveBeenCalledWith(
                expect.stringContaining('No registries specified'))
        })
    })

    describe('when logging into the registry fails', () => {

        const error = new Error('Kaboom!')

        beforeEach(() => {
            exec = jest.fn(() => Promise.reject(error))
        })

        it('should fail the action', async () => {
            await run(exec, core)
            expect(core.setFailed).toHaveBeenCalledWith(error.message)
        })
    })
})
