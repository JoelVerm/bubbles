export async function main(inp) {
    return await fetch('http://ai:8080/keywords?' + inp.postData.text).then(
        data => data.text()
    )
}
