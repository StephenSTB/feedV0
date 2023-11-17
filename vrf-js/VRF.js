import { execSync } from 'child_process';

export const generate_vrf = (private_key, message) =>{
    const output = execSync(`"./vrf-rs/target/debug/examples/generate-vrf" ${private_key} ${message}`, { encoding: 'utf-8' });
    const result = JSON.parse(output);
    return result;
}