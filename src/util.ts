// Adapted from https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string
export function humanFileSize(bytes: number, si: boolean=true, dp: number=1) : string {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }

    const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        let u = -1;
        const r = 10**dp;

        do {
            bytes /= thresh;
            ++u;
        } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


        return bytes.toFixed(dp) + ' ' + units[u];
}


export function humanRelativeTime(dateString: string): string{
    // TODO implement
    return dateString;
}

// get an absolute (relative to base) from a name considering the current path
export function joinPath(...fragments: string[]) :string {
    // remove ./ /./ etc
    fragments = fragments.filter(fragment => fragment != ".");
    return fragments.join('/').replace(/\/+/g, '/');
}

export function parentDir(path: string) : string {
    // Normalise path first
    path = joinPath(path);
    // remove "" either end with filter boolean
    const fragments: string[] = path.split("/").filter(Boolean);
    fragments.pop();
    return joinPath("/", ...fragments, "/");
}

// split a name from a path. For instance:
// /foo/bar/ -> /foo/ bar/
// /foo/bar/baz.exe -> /foo/bar/ baz.exe
export function splitName(path: string) : [string, string] {
    const parts = path.split('/');
    const end = parts.pop();

    if (end == "") {
        // directory
        const directory = parts.pop();
        return [parentDir(path), directory + "/"];
    } else {
        // file
        return [parentDir(path), end];
    }
}
