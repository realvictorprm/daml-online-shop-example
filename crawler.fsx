#r "nuget: FSharp.Data"
#r "nuget: FSharp.Json, 0.4.0"

open FSharp.Data
// type Mindfactory = HtmlProvider<"https://www.mindfactory.de/search_result.php/search_query/gpu/Hardware/Grafikkarten+(VGA)/GeForce+RTX+fuer+Gaming/RTX+3080+Ti.html">

let handler = System.Net.Http.HttpClientHandler()
handler.MaxConnectionsPerServer <- 1024
handler.UseProxy <- false
let httpClient = System.Net.Http.HttpClient(handler)

let urlExists url =
    try
        let res = httpClient.GetAsync(url: string) |> Async.AwaitTask |> Async.RunSynchronously
        res.IsSuccessStatusCode
    with e -> false

let inline replace (r: System.Text.RegularExpressions.Regex) (replacement: string) (str: string) =
    r.Replace(str, replacement) : string
let eur = System.Text.RegularExpressions.Regex("€")
let space = System.Text.RegularExpressions.Regex(" ")
let dot = System.Text.RegularExpressions.Regex("\.")
let komma = System.Text.RegularExpressions.Regex(",")
let star = System.Text.RegularExpressions.Regex("\*")
let numberMatcher = System.Text.RegularExpressions.Regex("\d*\.\d*")

let documents = [ "NVIDIA Grafikkarten online kaufen.html"
                  "AMD Grafikkarten online kaufen.html"
                  "Big-Tower Computer Gehaeuse online kaufen.html" ]
                |> List.map(fun it -> "/home/victor-da/Downloads/" + it)

let loadProductsFromHtmlFile (caseking: HtmlDocument) =
    let classes =
        [ "artbox grid_20 first last"; "artbox grid_5 first "; "artbox grid_5  "] 
    let products =
        caseking.Descendants ["div"]
        |> Seq.filter(fun it -> classes|> Seq.exists it.HasClass)
    let productNames =
        products
        |> Seq.collect(fun it -> it.Descendants ["span"] |> Seq.filter(fun it -> it.HasClass "ProductTitle") |> Seq.map(fun res -> (it, res)))
        |> Seq.map(fun (it, res) -> (it, res.DirectInnerText()))
        |> Map.ofSeq

    let productDescriptions =
        products
        |> Seq.collect(fun it -> it.Descendants ["p"] |> Seq.filter(fun it -> it.HasClass "desc") |> Seq.map(fun res -> (it, res)))
        |> Seq.map(fun (it, res) -> (it, res.DirectInnerText()))
        |> Map.ofSeq

    let productPrices =
        products
        |> Seq.collect(fun it -> it.Descendants ["span"] |> Seq.filter(fun it -> it.HasClass "price") |> Seq.map(fun res -> (it, res)))
        |> Seq.map(fun (it, res) -> (it, res.DirectInnerText()))
        |> Map.ofSeq

    let productImages =
        products
        |> Seq.choose(fun it -> it.Descendants ["img"] |> Seq.tryHead |> Option.bind(fun img -> img.TryGetAttribute "src") |> Option.map(fun res -> (it, res.Value())))
        |> Map.ofSeq

    let parsePrice (str: string) =
        
        let it =
            str
            // |> replace eur ""
            |> replace dot ""
            |> replace komma "."
            // |> replace star ""
        
        let it = numberMatcher.Match(it).Value
        printfn "prior: %s, now: %s" str it
        float it

    let adjustImageUrl (str: string) =
        let construct filename = "https://static3.caseking.de/media/image/thumbnail/" + filename + ".jpg"
        let filename = System.IO.Path.GetFileNameWithoutExtension(str)
        let betterQuality = filename.Replace("105x105", "285x255") |> construct
        if urlExists betterQuality then betterQuality
        else construct filename

    let random = System.Random()

    productNames
    |> Map.toArray
    |> Array.Parallel.map(fun (key, name) -> {| inventory = random.Next(100); name = name; description = productDescriptions.[key]; price = productPrices.[key] |> parsePrice; imgUrl = productImages.[key] |> adjustImageUrl |})

let actualProducts = documents |> Array.ofList |> Array.Parallel.map HtmlDocument.Load |> Array.Parallel.collect loadProductsFromHtmlFile

open FSharp.Json



System.IO.File.WriteAllText("test.json", Json.serialize actualProducts)

// https://static3.caseking.de/media/image/thumbnail/gcgb-355_gcgb_355_01_105x105.jpg
// gcgb-355_gcgb_355_01_105x105.webp
let count = actualProducts.Length
