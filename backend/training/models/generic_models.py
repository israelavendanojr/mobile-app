# Generic models
class Muscle(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Equipment(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class ExerciseType(models.TextChoices):
    COMPOUND = "compound", "Compound"
    ISOLATION = "isolation", "Isolation"
