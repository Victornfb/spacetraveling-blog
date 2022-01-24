{/* <script src="https://utteranc.es/client.js"
        repo="Victornfb/spacetraveling-blog"
        issue-term="pathname"
        theme="photon-dark"
        crossorigin="anonymous"
        async>
</script> */}

export function Comments() {
    return (
        <section
        style={{ width: '100%' }}
        ref={
            element => {
            if (!element) {
                return
            }

            const scriptElement = document.createElement('script')
            scriptElement.setAttribute('src', 'https://utteranc.es/client.js')
            scriptElement.setAttribute('repo', 'Victornfb/spacetraveling-blog')
            scriptElement.setAttribute('issue-term', 'pathname')
            scriptElement.setAttribute('theme', 'photon-dark')
            scriptElement.setAttribute('crossorigin', 'anonymous')
            scriptElement.setAttribute('async', 'true')
            element.replaceChildren(scriptElement)
            }
        }
        />
    )
}