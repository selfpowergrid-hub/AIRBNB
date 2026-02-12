$UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

function Get-PexelsImage {
    param (
        [string]$SearchTerm
    )
    try {
        $Uri = "https://www.pexels.com/search/$([uri]::EscapeDataString($SearchTerm))/"
        $Response = Invoke-WebRequest -Uri $Uri -UserAgent $UserAgent -UseBasicParsing
        # Regex to find image URLs. Pexels images often look like: https://images.pexels.com/photos/12345/pexels-photo-12345.jpeg...
        $Pattern = 'https://images\.pexels\.com/photos/\d+/[a-zA-Z0-9_-]+\.jpeg\?auto=compress&cs=tinysrgb&w=600'
        
        $Matches = [regex]::Matches($Response.Content, $Pattern)
        if ($Matches.Count -gt 0) {
            # Get a random one from the top 5 to vary it slightly if we run multiple times, 
            # but for now just the first valid one or first few.
            return $Matches[0].Value.Replace("w=600", "w=1920&h=1080") # Try to get high res
        }
        return $null
    }
    catch {
        Write-Host "Error fetching $SearchTerm : $_"
        return $null
    }
}

$HeroImg = Get-PexelsImage "black family luxury hotel lobby happy"
$SuiteImg = Get-PexelsImage "black woman working modern apartment"
$VillaImg = Get-PexelsImage "black family living room luxury relaxing"

Write-Host "HERO_URL: $HeroImg"
Write-Host "SUITE_URL: $SuiteImg"
Write-Host "VILLA_URL: $VillaImg"
