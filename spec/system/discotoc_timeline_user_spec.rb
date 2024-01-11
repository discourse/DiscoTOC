# frozen_string_literal: true

RSpec.describe "DiscoTOC", system: true do
  let!(:theme) { upload_theme_component }

  fab!(:category)
  fab!(:tag)

  fab!(:topic_1) { Fabricate(:topic) }
  fab!(:topic_2) { Fabricate(:topic, category: category, tags: [tag]) }
  
  fab!(:post_1) {
    Fabricate(:post, raw: "<div data-theme-toc='true'></div>\n\n# Heading 1\nContent for the first heading\n## Heading 2\nContent for the second heading\n### Heading 3\nContent for the third heading\n# Heading 4\nContent for the fourth heading", topic: topic_1)
  }

  fab!(:post_2) {
    Fabricate(:post, raw: "\n# Heading 1\nContent for the first heading\n## Heading 2\nContent for the second heading\n### Heading 3\nContent for the third heading\n# Heading 4\nContent for the fourth heading", topic: topic_2)
  }

  fab!(:post_3) {
    Fabricate(:post, raw: "intentionally \n long \n content \n so \n there's \n plenty \n to be \n scrolled \n past \n which \n will \n force \n the \n timeline \n to \n hide \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll ", topic: topic_1)
  }

  it "table of contents appears when the relevant markup is added to first post in topic" do
    visit("/t/#{topic_1.id}")

    expect(page).to have_css(".d-toc-item.d-toc-h1")
  end

  it "clicking the toggle button toggles the timeline" do
    visit("/t/#{topic_1.id}")

    find(".timeline-toggle").click

    expect(page).to have_css(".timeline-scrollarea-wrapper")

    find(".timeline-toggle").click

    expect(page).to have_css(".d-toc-item.d-toc-h1")
  end

  it "timeline does not appear when the table of contents is shown" do
    visit("/t/#{topic_1.id}")

    expect(page).to have_no_css(".topic-timeline")
  end

  it "table of contents is hidden when scrolled past the first post" do
    visit("/t/#{topic_1.id}")

    page.execute_script <<~JS
      window.scrollTo(0, document.body.scrollHeight);
    JS

    expect(page).to have_css(".topic-timeline")
  end

  it "table of contents does not appear if the first post does not contain the markup" do
    visit("/t/#{topic_2.id}")

    expect(page).to have_no_css(".d-toc-item.d-toc-h1")
  end

  it "timeline will appear without markup if auto_TOC_categories is set to the topic's category" do
    theme.update_setting(:auto_TOC_categories, "#{category.id}" )
    theme.save!
    
    visit("/t/#{topic_2.id}")

    expect(page).to have_css(".d-toc-item.d-toc-h1")
  end

  it "timeline will not appear automatically if auto_TOC_categories is set to a different category" do
    theme.update_setting(:auto_TOC_categories, "99" )
    theme.save!
    
    visit("/t/#{topic_2.id}")

    expect(page).to have_no_css(".d-toc-item.d-toc-h1")
  end

  it "timeline will appear without markup if auto_TOC_tags is set to the topic's tag" do
    theme.update_setting(:auto_TOC_tags, "#{tag.name}" )
    theme.save!
    
    visit("/t/#{topic_2.id}")

    expect(page).to have_css(".d-toc-item.d-toc-h1")
  end

  it "timeline will not appear automatically if auto_TOC_tags is set to a different tag" do
    theme.update_setting(:auto_TOC_tags, "wrong-tag" )
    theme.save!
    
    visit("/t/#{topic_2.id}")

    expect(page).to have_no_css(".d-toc-item.d-toc-h1")
  end

  it "timeline does not appear if it has fewer headings than TOC_min_heading setting" do
    theme.update_setting(:TOC_min_heading, 5)
    theme.save!
    
    visit("/t/#{topic_1.id}")

    expect(page).to have_no_css(".d-toc-item.d-toc-h1")
  end
end
