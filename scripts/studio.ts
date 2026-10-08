import {spawn} from 'node:child_process';
import {contentRoot} from './lib';

spawn('npx', ['remotion', 'studio', 'src/index.ts', `--public-dir=${contentRoot()}`], {stdio: 'inherit', shell: true});
