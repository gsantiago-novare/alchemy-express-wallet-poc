const mockFetch = (ms: number) =>
  new Promise((resolve) => setTimeout(() => resolve({ data: "mock api call" }), ms));

const MockController = {
    mockCall: async (req: any, res: any) => {
        console.log("MockController called");

        const [spotify, youtube, insta] = await Promise.all([
          mockFetch(190),
          mockFetch(80),
          mockFetch(30),
          mockFetch(290),
          mockFetch(10),
        ]);

    console.log("returning response", { spotify, youtube, insta });
    return res.status(200).send({ spotify, youtube, insta });
 }
}

export default MockController;
