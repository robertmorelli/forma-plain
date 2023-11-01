onmessage = async ({ data }: { data: FileSystemFileHandle }) => {
    const blob: Blob = await data.getFile();
    const reader = new FileReaderSync();
    const text = reader.readAsText(blob);
    postMessage(new Map([[data.name, text]]));
};
