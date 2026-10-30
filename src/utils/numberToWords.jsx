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
  const [integerPart, decimalPart] = number.toFixed(2).split(".")
  let result = ""

  // Convert integer part
  const integerNum = Number.parseInt(integerPart)

  if (integerNum < 1000) {
    result = convertLessThanOneThousand(integerNum)
  } else if (integerNum < 100000) {
    result = convertLessThanOneThousand(Math.floor(integerNum / 1000)) + " Thousand"
    if (integerNum % 1000 !== 0) {
      result += " " + convertLessThanOneThousand(integerNum % 1000)
    }
  } else if (integerNum < 10000000) {
    result = convertLessThanOneThousand(Math.floor(integerNum / 100000)) + " Lakh"
    if (integerNum % 100000 !== 0) {
      result += " " + convertNumberToWords(integerNum % 100000)
    }
  } else {
    result = convertLessThanOneThousand(Math.floor(integerNum / 10000000)) + " Crore"
    if (integerNum % 10000000 !== 0) {
      result += " " + convertNumberToWords(integerNum % 10000000)
    }
  }

  // Add decimal part if not zero
  if (Number.parseInt(decimalPart) !== 0) {
    result += " and " + decimalPart + "/100"
  }

  return result
}
