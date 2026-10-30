export function convertNumberToWords(number) {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ]
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

  // Function to convert a number less than 1000 to words
  function convertLessThanOneThousand(num) {
    if (num === 0) {
      return ""
    }

    if (num < 20) {
      return ones[num]
    }

    if (num < 100) {
      return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + ones[num % 10] : "")
    }

    return (
      ones[Math.floor(num / 100)] + " Hundred" + (num % 100 !== 0 ? " " + convertLessThanOneThousand(num % 100) : "")
    )
  }

  // Handle zero
  if (number === 0) {
    return "Zero"
  }

  // Split number into integer and decimal parts
  const parts = number.toString().split(".")
  let integerPart = Number.parseInt(parts[0], 10)

  // Handle Indian numbering system (Lakhs, Crores)
  let result = ""

  // Crores (10,000,000)
  if (integerPart >= 10000000) {
    const crores = Math.floor(integerPart / 10000000)
    result += convertLessThanOneThousand(crores) + " Crore "
    integerPart %= 10000000
  }

  // Lakhs (100,000)
  if (integerPart >= 100000) {
    const lakhs = Math.floor(integerPart / 100000)
    result += convertLessThanOneThousand(lakhs) + " Lakh "
    integerPart %= 100000
  }

  // Thousands (1,000)
  if (integerPart >= 1000) {
    const thousands = Math.floor(integerPart / 1000)
    result += convertLessThanOneThousand(thousands) + " Thousand "
    integerPart %= 1000
  }

  // Remaining (Hundreds, Tens, Ones)
  if (integerPart > 0) {
    result += convertLessThanOneThousand(integerPart)
  }

  return result.trim()
}

