# frozen_string_literal: true

RSpec.describe "DiscoTOC", system: true do
  let!(:theme) { upload_theme_component }

  fab!(:category)
  fab!(:tag)

  fab!(:topic_1) { Fabricate(:topic, category: category, tags: [tag]) }
  fab!(:topic_2) { Fabricate(:topic, category: category, tags: [tag]) }

  fab!(:post_1) do
    Fabricate(
      :post,
      raw:
        "<div data-theme-toc='true'></div>\n\n# Heading 1\nContent for the first heading\n## Heading 2\nContent for the second heading\n### Heading 3\nContent for the third heading\n# Heading 4\nContent for the fourth heading",
      topic: topic_1,
    )
  end

  fab!(:post_2) do
    Fabricate(
      :post,
      raw:
        "\n# Heading 1\nContent for the first heading\n## Heading 2\nContent for the second heading\n### Heading 3\nContent for the third heading\n# Heading 4\nContent for the fourth heading",
      topic: topic_2,
    )
  end

  fab!(:post_3) do
    Fabricate(
      :post,
      raw:
        "intentionally \n long \n content \n so \n there's \n plenty \n to be \n scrolled \n past \n which \n will \n force \n the \n timeline \n to \n hide \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll ",
      topic: topic_1,
    )
  end

  fab!(:post_4) do
    Fabricate(
      :post,
      raw:
        "<div data-theme-toc='true'></div>\n\n# Heading For Reply 1\nContent for the first heading\n## Heading For Reply 2\nContent for the second heading\n### Heading For Reply 3\nContent for the third heading\n# Heading For Reply 4\nContent for the fourth heading",
      topic: topic_1,
    )
  end

  fab!(:post_5) do
    Fabricate(
      :post,
      raw:
        "intentionally \n long \n content \n so \n there's \n plenty \n to be \n scrolled \n past \n which \n will \n force \n the \n timeline \n to \n hide \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll \n scroll ",
      topic: topic_1,
    )
  end

  it "table of contents button appears in mobile view" do
    visit("/t/#{topic_1.id}/?mobile_view=1")

    expect(page).to have_css(".d-toc-mini")
  end

  it "clicking the toggle button toggles the timeline" do
    visit("/t/#{topic_1.id}/?mobile_view=1")

    find(".d-toc-mini").click

    expect(page).to have_css(".d-toc-wrapper.overlay")
  end

  it "timeline toggle does not appear when the progress bar timeline is expanded" do
    visit("/t/#{topic_1.id}/?mobile_view=1")

    find("#topic-progress").click

    expect(page).to have_no_css(".timeline-fullscreen .timeline-toggle")
  end

  it "d-toc-mini is hidden when scrolled past the first post" do
    visit("/t/#{topic_1.id}/?mobile_view=1")

    page.execute_script <<~JS
      window.scrollTo(0, document.body.scrollHeight);
    JS

    expect(page).to have_no_css(".d-toc-mini")
  end

  it "d-toc-mini does not appear if the first post does not contain the markup" do
    visit("/t/#{topic_2.id}/?mobile_view=1")

    expect(page).to have_no_css(".d-toc-mini")
  end

  it "d-toc-mini will appear without markup if auto_TOC_categories is set to the topic's category" do
    theme.update_setting(:auto_TOC_categories, "#{category.id}")
    theme.save!

    visit("/t/#{topic_2.id}/?mobile_view=1")

    expect(page).to have_css(".d-toc-mini")
  end

  context "when disable TOC for replies" do
    before do
      theme.update_setting(:enable_TOC_for_replies, false)
      theme.save!
    end

    it "table of contents button won't appears in mobile view for replies" do
      visit("/t/-/#{topic_1.id}/3/?mobile_view=1")

      expect(page).to have_no_css(".d-toc-mini")
    end
  end

  context "when enable TOC for replies" do
    before do
      theme.update_setting(:enable_TOC_for_replies, true)
      theme.save!
    end

    it "table of contents button appears in mobile view for replies" do
      visit("/t/-/#{topic_1.id}/3/?mobile_view=1")

      expect(page).to have_css(".d-toc-mini")
    end

    it "d-toc-mini will not appear without markup for replies regardless of auto_TOC_categories and auto_TOC_tags" do
      theme.update_setting(:auto_TOC_categories, "#{category.id}")
      theme.update_setting(:auto_TOC_tags, "#{tag.name}")
      theme.save!

      visit("/t/-/#{topic_1.id}/2/?mobile_view=1")

      expect(page).to have_no_css(".d-toc-mini")
    end
  end

  it "d-toc-mini will not appear automatically if auto_TOC_categories is set to a different category" do
    theme.update_setting(:auto_TOC_categories, "99")
    theme.save!

    visit("/t/#{topic_2.id}/?mobile_view=1")

    expect(page).to have_no_css(".d-toc-mini")
  end

  it "d-toc-mini will appear without markup if auto_TOC_tags is set to the topic's tag" do
    theme.update_setting(:auto_TOC_tags, "#{tag.name}")
    theme.save!

    visit("/t/#{topic_2.id}/?mobile_view=1")

    expect(page).to have_css(".d-toc-mini")
  end

  it "d-toc-mini will not appear automatically if auto_TOC_tags is set to a different tag" do
    theme.update_setting(:auto_TOC_tags, "wrong-tag")
    theme.save!

    visit("/t/#{topic_2.id}/?mobile_view=1")

    expect(page).to have_no_css(".d-toc-mini")
  end

  it "d-toc-mini does not appear if it has fewer headings than TOC_min_heading setting" do
    theme.update_setting(:TOC_min_heading, 5)
    theme.save!

    visit("/t/#{topic_1.id}/?mobile_view=1")

    expect(page).to have_no_css(".d-toc-mini")
  end
end
