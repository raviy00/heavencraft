export default function Background() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden">
            {/* Dark gradient overlay */}
            <div
                className="absolute inset-0 z-10"
                style={{
                    background:
                        'linear-gradient(to bottom, rgba(16,25,34,0.45) 0%, rgba(16,25,34,0.92) 100%)',
                }}
            />
            {/* Minecraft landscape */}
            <div
                className="w-full h-full bg-cover bg-center bg-slow-zoom"
                style={{
                    backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCzk2lIDCaNAbGijPARQycFbyWTUre7dyM2G5MqNB6gWdwVVw3tnSkWqr_tUpLCPUNf3luNTVEKOjCYRkEmmG7PiCGNLcQ1hWveyM75ipg71f3uPM3uwUWawe5QUK-4hjpJJLsDMtRsQgD73sncjwVpNg-2VDETO1qH0CvZePGkvdJZWAsvksSZUXodSEZNWTR9Lpoo9DweZZ-_YNr-f0Mu1FhLndPM4F36pDYRKn7A6hVW3Jq7HHK1dpQfnSPVo_3iCFmJK_uS0YaX')",
                }}
                role="img"
                aria-label="Stylized Minecraft plains landscape at sunset"
            />
        </div>
    )
}
