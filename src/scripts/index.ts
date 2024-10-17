Main: {
    document.addEventListener(`DOMContentLoaded`, function () {
        const u: { d?: boolean, p?: (s: string) => void, w?: (s: string) => void } = {};
        utility: {
            const log = function (s: string): void {
                if (u.d) console.log(s);
            }
            const warn = function (s: string): void {
                if (u.d) console.warn(s);
            }
            Object.defineProperty(u, `d`, {
                value: false,
                enumerable: true,
                writable: true,
                configurable: false
            });
            Object.defineProperty(u, `p`, {
                value: log,
                enumerable: true,
                writable: false,
                configurable: false
            });
            Object.defineProperty(u, `w`, {
                value: warn,
                enumerable: true,
                writable: false,
                configurable: false
            });
            Object.seal(u);

            u?.p?.(`LOADING EVENT: added utility`);
        }

        const ui = {};
        FormBinding: {
            const uiForm = (document.forms as HTMLCollectionOf<HTMLFormElement> & { ui: HTMLFormElement }).ui;

            listen: {
                const setHashToUI = function (): void {
                    u?.p?.(`UI: set hash to ui`);
                    const formData = new FormData(uiForm);
                    const entries = Array.from(formData.entries());
                    const object = Object.fromEntries(entries);
                    const json = JSON.stringify(object);
                    const base64 = btoa(json);
                    const newUrl = `${window.location.pathname}#${base64}`;
                    // Use replaceState to avoid polluting the history
                    history.replaceState(null, '', newUrl);
                }
                uiForm.addEventListener('change', setHashToUI);
                u?.p?.(`LOADING EVENT: added form change listener`);
            }

            object: {
                const keys = Array.from((new FormData(uiForm)).keys());
                for (const key of keys) {
                    const get = function (): string | undefined {
                        u?.p?.(`UI: get ${key}`);
                        const formData: FormData = new FormData(uiForm);
                        const value: FormDataEntryValue | null = formData.get(key);
                        if (value === null) {
                            u?.w?.(`ERROR: failed to get value for key: ${key}`);
                            return undefined;
                        }
                        return value.toString();
                    }
                    const set = function (value: string): void {
                        u?.p?.(`UI: set ${key} to ${value}`);
                        try {
                            u?.p?.(`UI: set hash to ui`);
                            window.location.hash = btoa(JSON.stringify(ui));
                        }
                        catch {
                            u?.w?.(`ERROR: failed to set hash to ui`);
                            window.location.hash = `#`;
                        }
                        const radio: Element | null = document.querySelector(
                            `[type="radio"][name="${key}"][value="${value}"]`
                        );
                        if (radio !== null) return (radio as HTMLInputElement).click();

                        const check: Element | null = document.querySelector(
                            `[type="checkbox"][name="${key}"]`
                        );
                        if (check !== null) return (check as HTMLInputElement).click();

                        document.querySelector(`[name="${key}"]`)?.setAttribute(`value`, value);
                    }
                    Object.defineProperty(ui, key, {
                        get: get,
                        set: set,
                        enumerable: true,
                        configurable: false
                    });
                }
                Object.freeze(ui);
                try {
                    u?.p?.(`UI: set ui to hash`);
                    Object.assign(ui, JSON.parse(atob(window.location.hash.slice(1))));
                } catch {
                    u?.w?.(`ERROR: failed to set ui to hash`);
                    window.location.hash = `#`;
                };
            }

            u?.p?.(`LOADING EVENT: added form binding`);
        }
        type SvgFileCallaback = (name: string, data: string) => any;
        const reader: { svg?: (callback: SvgFileCallaback) => Promise<void> } = {};
        readerWorker: {
            const callbacks = new Map<string, SvgFileCallaback>();
            let worker: Worker
            try {
                const elem = document.querySelector("script[type='text\/js-worker']");
                if (elem === null) {
                    u?.w?.(`ERROR: failed to add worker: no script[type='text\/js-worker']`);
                    break readerWorker;
                }
                const blob = new Blob(
                    [elem.textContent as string],
                    { type: "text/javascript" },
                );
                const url = window.URL.createObjectURL(blob);
                worker = new Worker(url);
            }
            catch {
                u?.w?.(`ERROR: failed to add worker`);
                break readerWorker;
            }
            worker: {
                const onmessage = function ({ data }: { data: Map<string, string> }): void {
                    u?.p?.(`FILE: onmessage`);
                    const entry = data.entries().next();
                    if (entry.done) return u?.w?.(`ERROR: failed to add worker: no entry`);
                    const value = entry.value;
                    if (value === undefined) return u?.w?.(`ERROR: failed to add worker: no value`);
                    const [name, text] = value;
                    const callback = callbacks.get(name);
                    if (callback === undefined) return u?.w?.(`ERROR: failed to add worker: no callback`);
                    callbacks.delete(name);
                    callback(name, text);
                }
                worker.addEventListener("message", onmessage);
                Object.freeze(worker);

                u?.p?.(`LOADING EVENT: added worker`);
            }

            reader: {
                const open = async function (): Promise<FileSystemFileHandle | undefined> {
                    u?.p?.(`FILE: open`);
                    const files: FileSystemFileHandle[] = await window.showOpenFilePicker({
                        multiple: false,
                        types: [{ description: `SVG Files`, accept: { 'image/svg+xml': [`.svg`] } }]
                    });
                    return files.pop();
                }
                const read = async function (callback: SvgFileCallaback): Promise<void> {
                    u?.p?.(`FILE: read`);
                    const fileMaybe = await open();
                    if (fileMaybe === undefined) return u?.w?.(`ERROR: failed to read file`);
                    callbacks.set(fileMaybe.name, callback);
                    const file = fileMaybe;
                    u?.p?.(`WORKER: postMessage`);
                    worker.postMessage(file);
                }
                Object.defineProperty(reader, `svg`, {
                    value: read,
                    enumerable: true,
                    writable: false,
                    configurable: false
                });
                Object.freeze(reader);

                u?.p?.(`LOADING EVENT: added reader`);
            }

            addSVGButton: {
                const svg = reader.svg;
                if (svg === undefined) {
                    u?.w?.(`ERROR: failed to add add-svg button: no reader.svg`);
                    break addSVGButton;
                }
                const button = document.querySelector(`#add-svg`);
                if (button === null) {
                    u?.w?.(`ERROR: failed to add add-svg button: no #add-svg`);
                    break addSVGButton;
                }
                const onclick = function () {
                    u?.p?.(`EVENT: add-svg button onclick`);
                    svg(function (name, data) {
                        console.log(`name: ${name}\ndata: ${data}`);
                    });
                };
                button.addEventListener(`click`, onclick);

                u?.p?.(`LOADING EVENT: added add-svg button`);
            }

            u?.p?.(`LOADING EVENT: added reader worker`);
        }

        svgPathMaker: {
            const eventDiv = document.getElementById(`ap-wp`);
            const path = document.getElementById(`ap-wp-p`);
            if (eventDiv == null || path == null) break svgPathMaker;
            const style = document.documentElement.style;
            const setCurrentWorkingPath = function (newPath: number[]) {
                style.setProperty('--current-working-path',
                    `"M` + newPath.slice(0, 2).join(` `) +
                    (newPath.length > 4 ? `Q` + newPath.slice(2, -2).join(` `) : ``) + `"`
                );
            }
            let basicPath: number[] = [];
            let start = false;
            const onStart = function() {
                basicPath = [];
                start = true;
            };
            const onMove = function(event: PointerEvent) {
                if(!start) return;
                const {left, top} = eventDiv.getBoundingClientRect();
                const x = Math.round(event.clientX - left);
                const y = Math.round(event.clientY - top);
                if ((Math.pow(x - (basicPath.at(-2) ?? 0), 2) + Math.pow(y - (basicPath.at(-1) ?? 0), 2)) > 20) {
                    if (basicPath.length > 2)
                        basicPath.push(
                            ((basicPath.at(-2) ?? x) + x) / 2,
                            ((basicPath.at(-1) ?? y) + y) / 2,
                        );
                    basicPath.push(x, y);
                }
                setCurrentWorkingPath(basicPath);
            };
            const onEnd = function () {
                if(!start) return;
                start = false;
                const listOfParts: string[] = [];
                listOfParts.push(
                    `m ${basicPath[0]} ${basicPath[1]}`
                );
                for(let i = 2; i < basicPath.length - 2; i += 2){
                    listOfParts.push(
                        `C ${basicPath[i]} ${basicPath[i+1]} ${basicPath[i+2]} ${basicPath[i+3]}`
                    );
                }
                listOfParts.push(
                    `T ${basicPath[basicPath.length - 2]} ${basicPath[basicPath.length - 1]}`
                );

            };
            eventDiv.addEventListener('pointerdown', onStart);
            eventDiv.addEventListener('pointermove', onMove);
            eventDiv.addEventListener('pointerup', onEnd);
            eventDiv.addEventListener('pointercancel', onEnd);


            document.addEventListener('pointerup', onEnd);
            document.addEventListener('pointercancel', onEnd);
        }

        u?.p?.(`LOADING EVENT: added main`);
    });
}

