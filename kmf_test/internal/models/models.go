package models

type Rate struct {
	Fullname    string  `xml:"fullname"`
	Title       string  `xml:"title"`
	Description float64 `xml:"description"`
}

type Rates struct {
	Items []Rate `xml:"item"`
	Date  string `xml:"date"`
}
