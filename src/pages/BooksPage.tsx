import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import AdminItemsList from "@/components/AdminItemsList";
import { bookCategories } from "@/data/chapters";

const BooksPage = () => (
  <Layout>
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold mb-2">📚 Books</h1>
        <p className="text-muted-foreground mb-8">Recommended books for IIT JEE preparation</p>
      </motion.div>

      {["Physics", "Chemistry", "Mathematics", "General"].map((s) => (
        <AdminItemsList key={s} type="books" subject={s} title={`📌 ${s} — Admin Picks`} />
      ))}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {bookCategories.map((book, i) => (
          <motion.a
            key={book.name}
            href={book.link}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="section-card flex items-center gap-4"
          >
            <span className="text-4xl">{book.icon}</span>
            <div className="flex-1">
              <h3 className="font-display font-semibold">{book.name}</h3>
              <p className="text-sm text-muted-foreground">Download PDFs</p>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
          </motion.a>
        ))}
      </div>
    </div>
  </Layout>
);

export default BooksPage;
