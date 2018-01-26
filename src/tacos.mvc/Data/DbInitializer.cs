namespace tacos.data {
    public static class DbInitializer {
        public static void Initialize(TacoDbContext context) {
            context.Database.EnsureDeleted(); // TODO: remove after testing
            context.Database.EnsureCreated();

            var submission = new Submission { Actor = "postit" };
            var request = new Request { CourseNumber = "MAT 16", CalculatedTotal = 20.5  };

            submission.Requests.Add(request);

            context.Submissions.Add(submission);
            context.SaveChanges();
        }
    }
}