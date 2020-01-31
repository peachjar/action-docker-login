import * as core from '@actions/core'
import { exec } from '@actions/exec'

import run from './run'

run(exec, core)
