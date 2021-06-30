let numberMatcher = System.Text.RegularExpressions.Regex("\d*\.\d*")

let parsePrice (str: string) =
    let inline replace (r: System.Text.RegularExpressions.Regex) (replacement: string) (str: string) =
        r.Replace(str, replacement) : string
    let eur = System.Text.RegularExpressions.Regex("€")
    let space = System.Text.RegularExpressions.Regex(" ")
    let dot = System.Text.RegularExpressions.Regex("\.")
    let komma = System.Text.RegularExpressions.Regex(",")
    let star = System.Text.RegularExpressions.Regex("\*")
    
    let it =
        str
        |> replace eur ""
        |> replace dot ""
        |> replace space ""
        |> replace komma "."
        |> replace star ""
    let it = numberMatcher.Match(it).Value
    printfn "%s" it
    float it

parsePrice("459,90 €*")