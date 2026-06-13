export function getAgeGroupDisplay(ageGroup: string) {
  switch (ageGroup) {
    case "NEONATE":
      return "Newborn (0-28 days)";
    case "PEDIATRIC":
      return "Child(1 month - 12 years)";
    case "ADULT":
      return "Adult (12-64 years)";
    case "GERIATRIC":
      return "Senior (65+)";
  }
}
